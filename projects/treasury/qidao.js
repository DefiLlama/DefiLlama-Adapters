const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xf32e759d5f1c63ed62042497d3a50f044ee0982b";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})