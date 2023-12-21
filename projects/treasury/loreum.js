const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x5d45A213B2B6259F0b3c116a8907B56AB5E22095";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
  },
})