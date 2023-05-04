const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x8b1522402fece066d83e0f6c97024248be3c8c01";

const GYRO = "0x1b239abe619e74232c827fbe5e49a4c072bd869d";


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',//BUSD
        '0x55d398326f99059fF775485246999027B3197955',//BSC-USD
        '0x5ca063a7e2bebefeb2bdea42158f5b825f0f9ffb',
        '0xa5399084a5f06d308c4527517bbb781c4dce887c',
     ],
    owners: [Treasury],
    ownTokens: [GYRO],
    resolveLP: true,
  },
})