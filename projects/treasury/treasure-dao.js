
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0eb5b03c0303f2f47cd81d7be4275af8ed347576";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [
      "0x539bde0d7dbd336b79148aa742883198bbf60342", // MAGIC
      "0x872bAD41CFc8BA731f811fEa8B2d0b9fd6369585", // GFLY
    ],
    tokens: [
      nullAddress,
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",  // USDC
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",  // WETH
      "0xb7e50106a5bd3cf21af210a755f9c8740890a8c9",  // SLP
    ],
  },
});