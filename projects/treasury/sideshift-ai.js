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
      "0xcda86a272531e8640cd7f1a92c01839911b90bb0",
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