const {getUniTVL} = require('./helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  heco:{
    tvl: getUniTVL({
      factory: '0x13D1EA691C8153F5bc9a491d41b927E2baF8A6b1',
      fetchBalances: true,
      useDefaultCoreAssets: true,
    })
  },
}