
const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
    heco: {
      tvl: getUniTVL({
        factory: '0xe0367ec2bd4ba22b1593e4fefcb91d29de6c512a',
        fetchBalances: true,
        useDefaultCoreAssets: true,
      }),
    },
    bsc: {
      tvl: getUniTVL({
        factory: '0x7897c32cbda1935e97c0b59f244747562d4d97c1',
        fetchBalances: true,
        useDefaultCoreAssets: true,
      }),
    },
    ethereum: {
      tvl: getUniTVL({
        factory: '0x8d0fCA60fDf50CFE65e3E667A37Ff3010D6d1e8d',
        fetchBalances: true,
        useDefaultCoreAssets: true,
      }),
    },
    avax: {
      tvl: getUniTVL({
        factory: '0xDeC9231b2492ccE6BA01376E2cbd2bd821150e8C',
        fetchBalances: true,
        useDefaultCoreAssets: true,
      }),
    },
    okexchain: {
      tvl: getUniTVL({
        factory: '0xff65bc42c10dcc73ac0924b674fd3e30427c7823',
        fetchBalances: true,
        useDefaultCoreAssets: true,
      }),
    },
}; // node test.js projects/bxh/index.js
