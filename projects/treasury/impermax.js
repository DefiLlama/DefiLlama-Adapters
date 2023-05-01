const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x7f959c082bc30f3ea88187fac1a640438ad7bf20";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})