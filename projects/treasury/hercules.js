
const { treasuryExports } = require("../helper/treasury");

const treasury = "0x5c24bA2eA12f94E9F3476eaBDf10373dC2913605";

module.exports = treasuryExports({
  metis: {
    owners: [treasury],
    ownTokens: [   
      '0xbB1676046C36BCd2F6fD08d8f60672c7087d9aDF',
     ],
    tokens: []
  },
});