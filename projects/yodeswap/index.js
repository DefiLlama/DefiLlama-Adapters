const { getUniTVL, staking, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const YodeDEX = '0x6FC4563460d5f45932C473334d5c1C5B4aEA0E01'
const USDC = '0x765277EebeCA2e31912C9946eAe1021199B39C61' //bridged Multichain USDC
const BUSD = '0x332730a4F6E03D9C55829435f10360E13cfA41Ff'
const BNB = '0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F'
const WBTC = '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f'
const ETH = '0xB44a9B6905aF7c801311e8F4E76932ee959c663C'
const USDT = '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'
const coreAssets = ['0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101', USDC, USDT, BNB, BUSD, WBTC, ETH]
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
