const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xac459b2b29401b5a4ea90de4320d0956cf86cdbd";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})