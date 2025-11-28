const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  hyperliquid:{
    tvl: getUniTVL({ factory: '0xd0a07E160511c40ccD5340e94660E9C9c01b0D27', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'cAMM' }),
  },
}