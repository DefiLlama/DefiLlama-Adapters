const ADDRESSES = require('../helper/coreAssets.json')

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
      ADDRESSES.arbitrum.USDC,  // USDC
      ADDRESSES.arbitrum.WETH,  // WETH
      "0xb7e50106a5bd3cf21af210a755f9c8740890a8c9",  // SLP
    ],
  },
});