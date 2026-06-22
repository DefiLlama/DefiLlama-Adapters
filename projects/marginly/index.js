const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const config = {
  arbitrum: {
    factories: [
      {
        factory: "0x1e36749E00229759dca262cB25Ad8d9B21bEB3F5",
        fromBlock: 144171029,
        version: "v1",
      },
      {
        factory: "0x537A3417Fe03e28F4E9640Bece70887a6938ff92",
        fromBlock: 208756175,
        version: "v1.5",
      },
      {
        factory: "0x4a805A6dbaCF824D5A39b9f3559aeFb831C1df95",
        fromBlock: 220673210,
        version: "v1.5",
      },
    ],
  },
  blast: {
    factories: [
      {
        factory: "0x1768Faee0A63927FeB81100046f5D63BfE0f08dB",
        fromBlock: 501400,
        version: "v1.5",
      },
    ],
  },
  ethereum: {
    factories: [
      {
        factory: "0xF8D88A292B0afa85E5Cf0d1195d0D3728Cfd7070",
        fromBlock: 19824726,
        version: "v1.5",
      },
    ],
  },
};

module.exports = {
  methodology:
    "Counts the number of base and quote tokens in every marginly pool",
};

Object.keys(config).forEach((chain) => {
  const { factories } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = [];
      for (const { factory, fromBlock, version } of factories) {
        let logs;
        if (version === "v1") {
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

  module.exports[chain].tvl = () => ({})
});
