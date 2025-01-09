const ADDRESSES = require('../helper/coreAssets.json')

const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x8cFDF9E9f7EA8c0871025318407A6f1Fbc5d5a18";
const loot = "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7"

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.WETH],
    owners: [treasury],
    ownTokens: [loot] // loot
  },
  polygon: {
    tokens: [nullAddress, ADDRESSES.polygon.WETH_1], //weth
    owners: [treasury],
  },
});