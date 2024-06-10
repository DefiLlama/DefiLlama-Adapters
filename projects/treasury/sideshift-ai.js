const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
    ],
    owners: ['0x8f456e525ed0115e22937c5c8afac061cc697f21'],
    ownTokens: [],
  },
})