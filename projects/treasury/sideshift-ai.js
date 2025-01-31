const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const owners = ['0x8f456e525ed0115e22937c5c8afac061cc697f21']

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
    ],
    owners,
    ownTokens: [],
  },
  mantle: {
    tokens: [
      ADDRESSES.mantle.mETH,
      ADDRESSES.bob.FBTC
    ],
    owners,
    ownTokens: [],
  },
  arbitrum: {
    tokens: [
    ],
    owners,
    ownTokens: [],
  },
})