const { getResources } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const spRootAddress =
  "0xccd1a84ccea93531d7f165b90134aa0415feb30e8757ab1632dac68c0055f5c2";

let resourcesCache;

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources(spRootAddress);
  return resourcesCache;
}

const brokersFilter = (i) =>
  i.type.includes(`${spRootAddress}::broker::Broker`);

function processBrokerData(brokerDataArray) {
  const result = {};

  brokerDataArray.map((item) => {
    const { type, data } = item;
    const sum = parseInt(data.available) + parseInt(data.borrowed);
    result[type] = sum;
  });

  return result;
}

function simplifyKeys(balanceData) {
  const simplifiedData = {};
  Object.entries(balanceData).forEach(([key, value]) => {
    const newKey = key.match(/<([^>]+)>/)[1];
    simplifiedData[newKey] = value;
  });

  return simplifiedData;
}

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL from all brokers in the Superposition protocol.",
  aptos: {
    tvl: async () => {
      const resources = await _getResources();
      const brokers = resources.filter(brokersFilter);
      const balanceData = processBrokerData(brokers);
      const balances = simplifyKeys(balanceData);
      return transformBalances("aptos", balances);
    },
  },
};
