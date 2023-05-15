const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xae792a7bf5f85a68ffe92bfbfa7a04c72d7cb095";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})