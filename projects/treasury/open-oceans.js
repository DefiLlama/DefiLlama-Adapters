const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x61e807038ae880d964a15a57c8cc74a634bccc26";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})