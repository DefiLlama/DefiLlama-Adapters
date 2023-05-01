const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x9474b771fb46e538cfed114ca816a3e25bb346cf";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})