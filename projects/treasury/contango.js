const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryARB = "0x643178CF8AEc063962654CAc256FD1f7fe06ac28"

module.exports = treasuryExports({
  arbitrum: {
    tokens: [
      nullAddress,
    ],
    owners: [treasuryARB],
  },
});
