const { staking, } = require('../helper/unknownTokens')
const { getExports } = require('../helper/heroku-api')

const chain = 'dogechain'
const YodeDEX = '0x6FC4563460d5f45932C473334d5c1C5B4aEA0E01'
const lps = ['0x2Dd53abcFEBE71a9Cd5dFF4f44458E14707F9280']

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("yodeswap", ['dogechain']),
}


module.exports.dogechain.staking = staking({
  chain,
  owner: '0x707Ee40734454162b7720B665Fa2aA0f7c2C6983',
  tokens: [YodeDEX],
  useDefaultCoreAssets: true,
  lps,
})
