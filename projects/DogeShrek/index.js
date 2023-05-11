const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      useDefaultCoreAssets: true,
      factory: '0x7C10a3b7EcD42dd7D79C0b9d58dDB812f92B574A',
    })
  }
}