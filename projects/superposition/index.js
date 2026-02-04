const { getResources } = require("../helper/chain/aptos");

const spRootAddress =
  "0xccd1a84ccea93531d7f165b90134aa0415feb30e8757ab1632dac68c0055f5c2";

let resourcesCache;

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources(spRootAddress);
  return resourcesCache;
}

const brokersFilter = (i) =>
  i.type.includes(`${spRootAddress}::broker::Broker`);

const coinToFungibleAssetFilter = (i) =>
  i.type.includes(`${spRootAddress}::map::Map`);

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
      // Superposition uses custom coin types to represent fungible assets
      // Find the fungible asset address so DefiLama can find
      // the correct token price
      const mapType = `${spRootAddress}::map::Map<${coinType}>`;
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
  methodology: "Aggregates TVL from all brokers in the Superposition protocol.",
  aptos: {
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
