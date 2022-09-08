const { unknownTombs, sumTokensExport, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const tokenAddress = '0x7a07120568Cf4C49989770E7F8C1F141a65e574f'
const shareAddress = '0x7c083976e5fCD14D81299e6Ad3ED2f724Fed08DD'
const genesisPool = '0x16C3877C5dc73a7E2d21273783bB764E77A57D17'
const genesisPartner = '0xf4f76B776a1Dd93fD7dE5C6458dad081AF8A5B22'
const masonry = '0xb731146fD17254b5Da40a820A760243971ac14E0'

const lps = ['0x66B2dDaf0844Bf91f1B308920360f1A35BC02aE2' , // LP DOGGY/WDOGE
]

module.exports = unknownTombs({
  lps,
  token: tokenAddress,
  shares: [shareAddress],
  rewardPool: '0x16C3877C5dc73a7E2d21273783bB764E77A57D17',
  masonry: [masonry],
  chain,
  useDefaultCoreAssets: true,
})

module.exports[chain].tvl = sumTokensExport({ chain, owner: genesisPool, tokens: [
  '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
  '0x66B2dDaf0844Bf91f1B308920360f1A35BC02aE2',
  '0x765277EebeCA2e31912C9946eAe1021199B39C61',
  '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
], useDefaultCoreAssets: true, })
module.exports.misrepresentedTokens = true
