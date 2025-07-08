const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x750129c21c7846cfe0ce2c966d84c0bca5658497";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [   
      '0x3082cc23568ea640225c2467653db90e9250aaa0', //RDNT
     ],
    tokens: [
      nullAddress,
    ],
  },
});