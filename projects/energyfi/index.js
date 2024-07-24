const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  moonbeam: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x7c7EaEa389d958BB37a3fd08706Ca884D53Dc1F3',
    })
  }
}
