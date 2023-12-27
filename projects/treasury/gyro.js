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
        '0x5ca063a7e2bebefeb2bdea42158f5b825f0f9ffb',
        '0xa5399084a5f06d308c4527517bbb781c4dce887c',
     ],
    owners: [Treasury],
    ownTokens: [GYRO],
    resolveLP: true,
  },
})