const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xfdb1157ac847d334b8912df1cd24a93ee22ff3d0";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury,],
  },
})