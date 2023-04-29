const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x8b1522402fece066d83e0f6c97024248be3c8c01";

const GYRO = "0x1b239abe619e74232c827fbe5e49a4c072bd869d";


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.BUSD,//BUSD
        ADDRESSES.bsc.USDT,//BSC-USD
     ],
    owners: [Treasury],
    ownTokens: [GYRO],
  },
})