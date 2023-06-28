const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x65FDCD48c4807F67429Bdc731d6964f5553CdB36";

module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
     ],
    owners: [treasury,],
  },
})