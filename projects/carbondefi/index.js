const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    fromBlock: 17087375,
    controller: "0xC537e898CD774e2dCBa3B14Ea6f34C93d5eA45e1",
  },
  sei_evm: {
    fromBlock: 79146720,
    controller: "0xe4816658ad10bF215053C533cceAe3f59e1f1087",
  },
};

Object.keys(config).forEach((chain) => {
  const { controller, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: controller,
        topic: "PairCreated(uint128,address,address)",
        eventAbi:
          "event PairCreated(uint128 indexed pairId, address indexed token0, address indexed token1)",
        onlyArgs: true,
        fromBlock,
      });
      const tokens = logs.map((i) => [i.token0, i.token1]).flat();

      return sumTokens2({ api, owner: controller, tokens });
    },
  };
});
