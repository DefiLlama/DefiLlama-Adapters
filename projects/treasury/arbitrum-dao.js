const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf3fc178157fb3c87548baa86f9d24ba38e649b58";
const ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ARB,
     ],
    owners: [treasury],
    ownTokens: [ARB],
  },
})
