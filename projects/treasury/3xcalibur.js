const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x5f49174fdeb42959f3234053b18f5c4ad497cc55";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})