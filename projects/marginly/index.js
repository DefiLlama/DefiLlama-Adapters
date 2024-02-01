const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = require("./config");

module.exports = {
  methodology:
    "Counts the number of base and quote tokens in every marginly pool",
  timetravel: true,
};

Object.keys(config).forEach((chain) => {
  const { factories } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _2, { api }) => {
      const ownerTokens = [];
      for (const { factory, fromBlock } of factories) {
        const logs = await getLogs({
          api,
          target: factory,
          topic: "PoolCreated(address,address)",
          eventAbi:
            "event PoolCreated(address indexed quoteToken, address indexed baseToken, address uniswapPool, bool quoteTokenIsToken0, address pool)",
          onlyArgs: true,
          fromBlock,
        });
        logs.forEach((i) =>
          ownerTokens.push([[i.quoteToken, i.baseToken], i.pool])
        );
      }
      return sumTokens2({ api, ownerTokens });
    },
  };
});
