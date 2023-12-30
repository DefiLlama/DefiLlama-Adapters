const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x65FDCD48c4807F67429Bdc731d6964f5553CdB36";

module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.WBNB,
     ],
    owners: [treasury,],
  },
})