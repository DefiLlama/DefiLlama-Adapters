const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");
const treasury = "0xbaECbdde43C6c6a167c37d5b789023592B27fF93";

module.exports = treasuryExports({
  moonbeam: {
    tokens: [
      nullAddress,
      ADDRESSES.moonbeam.USDT,
      ADDRESSES.moonbeam.USDC,
      ADDRESSES.moonbeam.WGLMR
    ],
    owners: [treasury]
  },
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDT
    ],
    owners: [treasury]
  },
  polygon: {
    tokens: [
      nullAddress,
      ADDRESSES.polygon.USDT
    ],
    owners: [treasury]
  },
})