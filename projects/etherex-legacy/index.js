const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  linea:{
    tvl: getUniTVL({ factory: '0xC0b920f6f1d6122B8187c031554dc8194F644592', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'cAMM' }),
  },
}