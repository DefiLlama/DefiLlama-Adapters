const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ chain: 'avax', useDefaultCoreAssets: true, factory: '0xCFBA329d49C24b70F3a8b9CC0853493d4645436b', }),
  },
}