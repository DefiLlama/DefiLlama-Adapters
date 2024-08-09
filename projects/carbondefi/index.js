const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    fromBlock: 17087375,
    controller: "0xC537e898CD774e2dCBa3B14Ea6f34C93d5eA45e1",
  },
  sei: {
    fromBlock: 79146720,
    controller: "0xe4816658ad10bF215053C533cceAe3f59e1f1087",
  },
  celo: {
    fromBlock: 26828280,
    controller: "0x6619871118D144c1c28eC3b23036FC1f0829ed3a",
    gasToken: ADDRESSES.celo.CELO,
  },
};

Object.keys(config).forEach((chain) => {
  const { controller, fromBlock, gasToken } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const pairs = await api.call({
        target:controller,
        abi: 'function pairs() view returns (address[2][])',
      })
      const tokens = pairs.filter(pair => !gasToken || (pair[0] !== gasToken && pair[1] !== gasToken)).flat()

      return sumTokens2({ api, owner: controller, tokens });
    },
  };
});
