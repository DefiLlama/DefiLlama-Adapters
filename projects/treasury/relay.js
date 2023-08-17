const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf803dce584b7ecb57f90af0b85e67dac7e0da6d9";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})