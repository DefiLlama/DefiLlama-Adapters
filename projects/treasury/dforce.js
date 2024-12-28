
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xc097ea3ea6d6851e8c274ace6373107c5a253f62";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [   
     ],
    tokens: [
      nullAddress,
    ],
  },
});