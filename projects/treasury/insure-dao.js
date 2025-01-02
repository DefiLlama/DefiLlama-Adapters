const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xd076397ec36f1c92939bd8cda9f9f7734f308c4b";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})