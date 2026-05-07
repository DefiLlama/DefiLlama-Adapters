const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x81ff99181d4Bdd14f64dC1a0e1A98EF81688bA0a";

module.exports = treasuryExports({
  base: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})