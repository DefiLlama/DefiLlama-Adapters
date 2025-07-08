const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x8d9249e6049bb17c15007bc58a5bec12a5af4346";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})