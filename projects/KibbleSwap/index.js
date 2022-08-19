const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      useDefaultCoreAssets: true,
      factory: '0xF4bc79D32A7dEfd87c8A9C100FD83206bbF19Af5',
    })
  }
}
