const { treasuryExports } = require("../helper/treasury");

const treasuryARB = "0x643178CF8AEc063962654CAc256FD1f7fe06ac28"

module.exports = treasuryExports({
  isComplex: true,
  complexOwners: ['0x4577b1417bdd10bf1bbfc8cf29180f592b0c3190'],
  arbitrum: {
    owners: [treasuryARB, '0x4577b1417bdd10bf1bbfc8cf29180f592b0c3190'],
    ownTokens: ['0xC760F9782F8ceA5B06D862574464729537159966']
  },
});
