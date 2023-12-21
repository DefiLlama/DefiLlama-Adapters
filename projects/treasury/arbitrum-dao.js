const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf3fc178157fb3c87548baa86f9d24ba38e649b58";
const ARB = ADDRESSES.arbitrum.ARB;

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
