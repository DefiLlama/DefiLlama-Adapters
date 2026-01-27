const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  hyperliquid: {
    factory: "0xF77Bd082c627aA54591cF2f2EaA811fd1AB3b1F3",
    fromBlock: 17877130,
    isAlgebra: true,
    blacklistedOwners: ["0xbAd2fB864FBD3f8b9bCC81512D7C8Ee1Aa0a8D6C"]
  },
});
