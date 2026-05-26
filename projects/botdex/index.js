const { uniV3Export } = require("../helper/uniswapV3");

module.exports = {
  methodology:
    "TVL is the sum of tokens locked in BotDex V3 pools on BotChain, fetched by indexing PoolCreated events from the V3 factory.",
  ...uniV3Export({
    bot: {
      factory: "0x1C51c173323ec11BB4e3C4fD2314c225Dc4b5419",
      fromBlock: 143372, // V3_FACTORY_DEPLOY_BLOCK
    },
  }),
};
