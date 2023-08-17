const constants = require("../koyo/constants");
const { treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  boba: {
    tokens: Object.values(constants.addresses.boba.tokens),
    owners: [constants.addresses.boba.treasury],
    ownTokens: [constants.addresses.boba.tokens.KYO],
  },
  ethereum: {
    tokens: [
      constants.addresses.ethereum.USDC
    ],
    owners: [constants.addresses.ethereum.treasury],
    ownTokens: [],
  },
})
