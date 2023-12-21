const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x6B09Aa7a03d918b08C8924591fc792ce9d80CBb5',
    })
  }
}