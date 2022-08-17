const { getUniTVL, staking, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const YodeDEX = '0x6FC4563460d5f45932C473334d5c1C5B4aEA0E01'
const coreAssets = ['0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101']
const lps = ['0x2Dd53abcFEBE71a9Cd5dFF4f44458E14707F9280']


module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain, coreAssets,
      factory: '0xAaA04462e35f3e40D798331657cA015169e005d7',
    }),
    staking: staking({
      chain, coreAssets,
      owner: '0x707Ee40734454162b7720B665Fa2aA0f7c2C6983',
      tokens: [YodeDEX],
      lps,
     })
  }
}
