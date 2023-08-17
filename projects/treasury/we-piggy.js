const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0d189fd8d46e43b2f13390de95d4f8e185eb3914";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})