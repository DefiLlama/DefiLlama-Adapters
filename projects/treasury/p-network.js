const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xcdb0b4b32d22084f6a20aeafaa389c9ed8865945";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})