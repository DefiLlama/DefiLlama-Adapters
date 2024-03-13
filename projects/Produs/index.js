const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: '0x8ae5527706446943cBA8589313EC217a4a7288a4', useDefaultCoreAssets: true, fetchBalances: true, }),
  },
};
