const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x2c41fb81cfc64cd1373058f2a13289819641d223";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})