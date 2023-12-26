const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x5be4fb908a43d61b1c8086fe62e39ae8ec483926";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})