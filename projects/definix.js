const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
  bsc: {
    tvl: getUniTVL({ factory: '0x43eBb0cb9bD53A3Ed928Dd662095aCE1cef92D19', useDefaultCoreAssets: true, }),
  },
  klaytn: {
    tvl: getUniTVL({ factory: '0xdee3df2560bceb55d3d7ef12f76dcb01785e6b29', useDefaultCoreAssets: true, }),
  },
};
