const {
  queryContract: queryContractCosmos
} = require("../helper/chain/cosmos");

// node test.js projects/silostake/index.js
const config = {
  sei: {
    coinGeckoId: "sei-network",
    hub: "sei1e3gttzq5e5k49f9f5gzvrl0rltlav65xu6p9xc0aj7e84lantdjqp7cncc",
    coinGeckoMap: {
      usei: "sei-network",
    }
  }
};

async function getState(chain, contract) {
  if (!contract) {
    return {};
  }
  return queryContractCosmos({
    contract,
    chain,
    data: { state: {} },
  });
}

module.exports = {
  timetravel: false
};

Object.keys(config).forEach(chain => {
  const { coinGeckoId, hub } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      // Logic for calculating TVL - just get total ustake.
      let state = await getState(chain, hub);

      let total_ustake = state['total_ustake'];

      api.add(coinGeckoId, total_ustake / 10 ** 6, { skipChain: true });
      
      return api.getBalances();
    },
  };
});
