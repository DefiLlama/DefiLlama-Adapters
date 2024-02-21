
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x28fda5fb2ac9436bc4bb8bedafee25a550956de6";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [   
     ],
    tokens: [
    ],
  },
});