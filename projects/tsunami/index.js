const { uniV3Export } = require("../helper/uniswapV3");

const config = uniV3Export({
  ink: {
    factory: "0xD8B0826150B7686D1F56d6F10E31E58e1BCF1193",
    fromBlock: 39943476,
    permitFailure: true,
  },
});

module.exports = {
  methodology:
    "TVL is the sum of token balances locked across all Tsunami V3 pools. Pools are enumerated via PoolCreated events from the TsunamiV3Factory (0xD8B0826150B7686D1F56d6F10E31E58e1BCF1193) on Ink (chain ID 57073).",
  ...config,
};
