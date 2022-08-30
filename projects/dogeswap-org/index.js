const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      useDefaultCoreAssets: true,
      factory: '0xD27D9d61590874Bf9ee2a19b27E265399929C9C3',
      fetchInChunks: 500,
    })
  }
}
