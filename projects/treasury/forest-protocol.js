const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xb785a37De028BDA5379F8D3f8045484F2e582c54";
const FOREST = "0x8D33F0Ae6d111212D9d64B0821c7Cf09E6270C27";
const bscFOREST = "0x11cf6bF6D87CB0EB9c294fd6CBFEC91EE3a1A7D0"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
    ownTokens: [FOREST],
  },
  bsc: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
    ownTokens: [bscFOREST],
  },
})