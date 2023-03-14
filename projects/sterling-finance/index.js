const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum:{
    tvl: getUniTVL({
      factory: '0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC',
      fetchBalances: true,
      useDefaultCoreAssets: true,
    })
  },
}