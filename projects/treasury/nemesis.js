const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const nemeTreasury1 = "0xdFFb6FB92E3F54C0DAa59e5af3f47fD58824562a";

const NMS = "0x8ac9dc3358a2db19fdd57f433ff45d1fc357afb3";


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.BUSD,//BUSD
     ],
    owners: [nemeTreasury1],
    ownTokens: [NMS],
  },
})