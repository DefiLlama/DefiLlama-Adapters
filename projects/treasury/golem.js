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
    ],
    owners: [treasury, '0x70a0a7be87deb51e1fab16d4f2bf00be1510e476'],
    ownTokens: [GLM]
  },
})