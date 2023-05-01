const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xd16d904b68429b93f1dfcd837f61aedcd224e8f4";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})