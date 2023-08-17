const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x70f4f7a85100348fc33f1d8005703c8953bc67fd";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})