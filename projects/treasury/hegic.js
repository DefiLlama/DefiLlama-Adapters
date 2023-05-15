const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf15968a096fc8f47650001585d23bee819b5affb";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})