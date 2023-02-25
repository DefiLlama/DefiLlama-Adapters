const { default: BigNumber } = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");

//////////////////////////////////////////////////
// Define a few constants and functions
//////////////////////////////////////////////////
// Return 1000 markers (i.e. collateralized tokens minted on Provenance) per call to limit stress on node
const paginationLimit = 1000;

/** Marker API call to Provenance Blockchain.
 * @param key - indexing values based on the pagination limit.
 */
const provenanceMarkerApi = (key) =>
  `https://api.provenance.io/provenance/marker/v1/all?pagination.limit=${paginationLimit}${
    key ? `&pagination.key=${key}` : ""
  }`;

/** Marker pricing API call. Comma delimited list of marker denoms is required to return
 * current pricing for each marker.
 * @param markerDenomList - list of marker denoms to query. Limited to 100 per query
 */
const markerPricingApi = (markerDenomList) => {
  return `https://figure.tech/service-pricing-engine/external/api/v1/pricing/marker/denom/list?denom[]=${markerDenomList.join(
    ","
  )}`;
};

/** Marker Supply API
 * @param denom - the marker denom to be queried for the existing supply on chain
 */
const markerSupplyApi = (denom) =>
  `https://api.provenance.io/cosmos/bank/v1beta1/supply/by_denom?denom=${denom}`;

/** dlob pricing API to retrieve current hash value at dlob.io. */
const dlobPricingApi =
  "https://www.dlob.io:443/gecko/external/api/v1/exchange/tickers";

/** Tail recursive function to retrieve markers from chain.
 * @param acc - stores the list of marker denoms on Provenance.
 * @param key - indexing key retrieved from the marker API call. On the first call,
 * the key will be empty. Once the key value is empty again, all markers will
 * have been retrieved from the blockchain.
 */

const getMarkers = async (acc, key) => {
  // Get the next list of markers as a MarkerList type
  const nextMarkers = await get(provenanceMarkerApi(key));
  // Set the next indexing key. Keys in the response are encoded in
  // Base64 while the expectation is Base64 URL encoding.
  // First, declare nextKey
  let nextKey = nextMarkers.pagination["next_key"];
  // If there is a key, convert it from base64 to base64url
  if (nextKey) {
    nextKey = Buffer.from(nextKey, "base64").toString("base64url");
  }
  // Update the accumulator
  acc = acc.concat(nextMarkers.markers.map((marker) => marker.denom));
  // Base case occurs when no next key is provided
  if (!nextKey) {
    return acc;
  } else {
    // Recursive call for the next set of markers
    return getMarkers(acc, nextKey);
  }
};

/** Tail recursive function to retrieve Provenance marker pricing info.
 * @param acc - stores the list of pricing responses from the pricing API in an array.
 * @param start - the starting point of the slice of the markerList. Initial value
 * should be set to 0.
 * @param end - the stopping point of the slice of the markerList. Initial value should
 * be set to 100
 * @param markerList - list of denoms to query the pricing API.
 */
const getPricing = async (acc, start, end, markerList) => {
  // Get pricing info
  const pricingInfo = await get(markerPricingApi(markerList.slice(start, end)));
  // Update accumulator
  acc = acc.concat(pricingInfo);
  // Set start value to current end value
  let newStart = end;
  // Stop if start index is greater than or equal to the length of the array
  if (newStart >= markerList.length) {
    return acc;
  } else {
    // Increase end value by 100
    let newEnd = end + 100;
    if (newEnd > markerList.length) newEnd = markerList.length;
    return getPricing(acc, newStart, newEnd, markerList);
  }
};

/** Tail recursive function to retrieve marker supply info.
 * @param acc - stores the pricing and supply values for each marker
 * @param index - the index of the marker being queried. This should
 * be initialied to 0.
 * @param markerPricingList - list of markers with pricing info
 */
const getSupplies = async (acc, index, markerPricingList) => {
  // Get supply info
  const supplyInfo = await get(
    markerSupplyApi(markerPricingList[index].markerDenom)
  );
  // Update accumulator with marker pricing and supply info
  acc = acc.concat([
    {
      denom: markerPricingList[index].markerDenom,
      supply: supplyInfo.amount.amount,
      price: markerPricingList[index].usdPrice,
    },
  ]);
  // Base case is at the end of the array
  if (index === markerPricingList.length - 1) {
    return acc;
  } else {
    return getSupplies(acc, index + 1, markerPricingList);
  }
};

//////////////////////////////////////////////////
// Calculate TVL
//////////////////////////////////////////////////
const tvl = async () => {
  // Get markers on chain as a list of denoms (strings)
  const markerList = await getMarkers([], "");

  // Get marker pricing as an array of type MarkerPricing. Filter out
  // any price that is set to $0. Also remove nhash as that pricing comes
  // from the dlob.io API.
  const markerPricing = (await getPricing([], 0, 100, markerList)).filter(
    (marker) => marker.usdPrice > 0 && marker.markerDenom !== "nhash"
  );

  // Get marker supply to calculate marker value locked on chain. Once returned,
  // reduce this to a single value representing asset TVL by multiplying the
  // supply by the price of each asset. The accumulator is initialized as a
  // BigNumber.
  const totalMarkerValue = (await getSupplies([], 0, markerPricing)).reduce(
    (acc, marker) =>
      new BigNumber(acc)
        .plus(new BigNumber(marker.supply).multipliedBy(marker.price))
        .toNumber(),
    0
  );

  return toUSDTBalances(totalMarkerValue);
};

module.exports = {
  timetravel: false,
  methodology:
    "Provenance TVL is calculated as the sum of the value of hash plus the value of collateralized tokens on chain.",
  provenance: { tvl },
};
