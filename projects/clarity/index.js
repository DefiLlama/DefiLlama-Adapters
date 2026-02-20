const { sumTokens2 } = require("../helper/chain/cardano");
const { get } = require("../helper/http");
const { clarityDaoTreasuryAddresses } = require("./dao-treasury-addresses");

const ADDRESSES_API_URL =
  "https://api.clarity.vote/metrics/getDefiLlamaAddresses";

function extractAddresses(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.addresses)) return response.addresses;
  if (Array.isArray(response?.data?.addresses)) return response.data.addresses;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

async function getTreasuryAddresses() {
  const response = await get(ADDRESSES_API_URL);
  const addresses = extractAddresses(response).filter(Boolean);
  if (!addresses.length)
    throw new Error(
      "Clarity address API returned no addresses in expected response shape"
    );
  return addresses;
}

async function tvl() {
  let owners = clarityDaoTreasuryAddresses;
  try {
    owners = await getTreasuryAddresses();
  } catch (e) {
    console.error(
      "Failed to fetch Clarity treasury addresses from API, using fallback list:",
      e?.message || e
    );
  }

  return await sumTokens2({
    owners,
  });
}

module.exports = {
  cardano: {
    tvl,
  },
};
