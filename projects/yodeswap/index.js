const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      coreAssets: ['0x6FC4563460d5f45932C473334d5c1C5B4aEA0E01','0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101'],
      factory: '0xAaA04462e35f3e40D798331657cA015169e005d7',
    })
  }
}