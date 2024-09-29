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
      "0xc96de26018a54d51c097160568752c4e3bd6c364"
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