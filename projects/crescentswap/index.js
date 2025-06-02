const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  arbitrum: { factory: "0x8219904A8683d06e38605276baCBf2D29aa764DD", fromBlock: 91137559, },
  base: { factory: "0x3539dA2AdB3f8311D203D334f25f7Bee604A5c50", fromBlock: 1979234, },
});
