const ADDRESSES = require('../helper/coreAssets.json')

const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x8cFDF9E9f7EA8c0871025318407A6f1Fbc5d5a18";


module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.WETH],
    owners: [treasury],
  },
  polygon: {
    tokens: [nullAddress, "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"], //weth
    owners: [treasury],
  },
});