const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      coreAssets: ['0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101'],
      factory: '0xD27D9d61590874Bf9ee2a19b27E265399929C9C3',
    })
  }
}