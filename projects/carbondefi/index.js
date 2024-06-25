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
};

Object.keys(config).forEach((chain) => {
  const { controller, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const pairs = await api.call({
        target:controller,
        abi: 'function pairs() view returns (address[2][])',
      })
      const tokens = pairs.flat()

      return sumTokens2({ api, owner: controller, tokens });
    },
  };
});
