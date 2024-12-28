const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xdb8f4c4c68e5e5eb501fee1adaa87ee767bcade7";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})