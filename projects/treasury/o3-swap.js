const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xb23d6fc44e40e56cb3b0d2c28ba3d7a170a07a49";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})