const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x881d440A7e047335BE81BBB27dBA6AEe9c2aa529";

module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
    ownTokens: ["0xc2A45FE7d40bCAc8369371B08419DDAFd3131b4a"] // LCD
  },
})