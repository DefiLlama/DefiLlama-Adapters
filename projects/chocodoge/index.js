const { unknownTombs, sumTokensExport, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const uscdAddress = '0x06AcD60e5B1CD9aB7E4beBfaA1233D3cCe97A08F'
const cdAddress = '0x51bB8f9a2A10c550DD149A9a48d8c4E8c59F4f56'
const genesisPool = '0x230486431185D4e2518191EcB8c2F80b6c520E8D'
const masonry = '0x06AcD60e5B1CD9aB7E4beBfaA1233D3cCe97A08F' // needs to be updated

const lps = ['0x44A46907f145173F1841B1a3E258FbBEB68608E8' , // LP USCD/USDC
             '0x32138fFD6d2B30f7b7295E32Cd9A19A7A590532E', // LP CD/USDC
             '0x68609eA0b8393258d0d7EF21401E1Cd3B00A714e', // LP USCD/DOGE
            ]

module.exports = unknownTombs({
  lps,
  token: cdAddress,
  shares: [uscdAddress],
  rewardPool: '0x2De8A4c253Ad9Bd6454e8566F09284F9a206Ba78',
  masonry: [masonry],
  chain,
  useDefaultCoreAssets: true,
})

module.exports[chain].tvl = sumTokensExport({ chain, owner: genesisPool, tokens: [
  '0x7B4328c127B85369D9f82ca0503B000D09CF9180',
  '0x68609eA0b8393258d0d7EF21401E1Cd3B00A714e',
  '0x765277EebeCA2e31912C9946eAe1021199B39C61',
  '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
], useDefaultCoreAssets: true, })
module.exports.misrepresentedTokens = true
