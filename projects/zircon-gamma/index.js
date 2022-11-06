const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl: getUniTVL({ chain: 'moonriver', factory: '0x6B6071Ccc534fcee7B699aAb87929fAF8806d5bd', useDefaultCoreAssets: true, }),
  },
};
