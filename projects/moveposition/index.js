const { getResources } = require("../helper/chain/aptos");

const mpRootAddress =
  "0xccd2621d2897d407e06d18e6ebe3be0e6d9b61f1e809dd49360522b9105812cf";

let resourcesCache;

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources(mpRootAddress, 'move');
  return resourcesCache;
}

const brokersFilter = (i) =>
  i.type.includes(`${mpRootAddress}::broker::Broker`);

const coinToFungibleAssetFilter = (i) =>
  i.type.includes(`${mpRootAddress}::map::Map`);

function processBrokerData(brokerDataArray, coinToFungibleAssetArray, isBorrowed = false) {
  const coinToFungibleAssetMap = coinToFungibleAssetArray.reduce(function(map, item) {
      map[item.type] = item.data.fa_metadata;
      return map;
  }, {});

  const result = {};

  brokerDataArray.map((item) => {
    const { type, data } = item;

    const brokerType = type;

    const coinType = brokerType.match(/<([^>]+)>/)[1];

    let tokenMint = coinType;
    {
      // Moveposition uses custom coin types to represent fungible assets
      // Find the fungible asset address so DefiLama can find
      // the correct token price
      const mapType = `${mpRootAddress}::map::Map<${coinType}>`;
      if (mapType in coinToFungibleAssetMap) {
        tokenMint = coinToFungibleAssetMap[mapType];
      }
    }

    result[tokenMint] = !isBorrowed ? parseInt(data.available) : parseInt(data.borrowed)
  });

  return result;
}

function addBalanceData(balanceData, api) {
  Object.entries(balanceData).forEach(([key, value]) => {
    api.add(key, value);
  });
}

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL from all brokers in the Moveposition protocol.",
  move: {
    tvl: async (api) => {
      const resources = await _getResources();
      const brokers = resources.filter(brokersFilter);
      const coinToFungibleAssetArray = resources.filter(
        coinToFungibleAssetFilter
      );
      const balanceData = processBrokerData(brokers, coinToFungibleAssetArray);
      addBalanceData(balanceData, api);
    },
    borrowed: async (api) => {
      const resources = await _getResources();
      const brokers = resources.filter(brokersFilter);
      const coinToFungibleAssetArray = resources.filter(
        coinToFungibleAssetFilter
      );
      const balanceData = processBrokerData(brokers, coinToFungibleAssetArray, true);
      addBalanceData(balanceData, api);
    },
  },
};
