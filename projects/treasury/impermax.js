const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc28F68cD2DF0fCc50f0058fB20abbc77Bec8bdc6";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
  base: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
  blast: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})
