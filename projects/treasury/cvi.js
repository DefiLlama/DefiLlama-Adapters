const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x7f4b135782c4a3b1c78c93f23f2016cb5cd96cc8";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})