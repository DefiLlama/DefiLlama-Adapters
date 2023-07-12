const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9";
const GLM = "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429";


module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.WSTETH,//wsteth
      "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39" //hex
    ],
    owners: [treasury],
    ownTokens: [GLM]
  },
})