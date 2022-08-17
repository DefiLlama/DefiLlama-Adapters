const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      coreAssets: ['0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101'],
      factory: '0x6B09Aa7a03d918b08C8924591fc792ce9d80CBb5',
    })
  }
}