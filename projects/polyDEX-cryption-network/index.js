const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x5bdd1cd910e3307582f213b33699e676e61dead9', }),
  },
}