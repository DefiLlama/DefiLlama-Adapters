const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = require("./config");

module.exports = {
  methodology:
    "Counts the number of base and quote tokens in every marginly pool",
};

Object.keys(config).forEach((chain) => {
  const { factories } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = [];
      for (const { factory, fromBlock } of factories) {
        let logs;
        if (chain === "arbitrum") {
          // v1.0 contract
          logs = await getLogs({
            api,
            target: factory,
            topic: "PoolCreated(address,address)",
            eventAbi:
              "event PoolCreated(address indexed quoteToken, address indexed baseToken, address uniswapPool, bool quoteTokenIsToken0, address pool)",
            onlyArgs: true,
            fromBlock,
          });
        } else {
          // v1.5 contract
          logs = await getLogs({
            api,
            target: factory,
            topic: "PoolCreated(address,address,address)",
            eventAbi:
              "event PoolCreated(address indexed quoteToken, address indexed baseToken, address indexed priceOracle, uint32 defaultSwapCallData, address pool)",
            onlyArgs: true,
            fromBlock,
          });
        }

        logs.forEach((i) =>
          ownerTokens.push([[i.quoteToken, i.baseToken], i.pool])
        );
      }
      return sumTokens2({ api, ownerTokens });
    },
  };
});
