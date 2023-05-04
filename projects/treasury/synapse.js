const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x1d9bfc24d9e7eeda4119ceca11eaf4c24e622e62";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})