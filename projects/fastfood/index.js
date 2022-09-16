const { unknownTombs, sumTokensExport, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const friesAddress = '0x5c4C5759063b06855Dd086232A2eA0Ab5965e546'
const burgerAddress = '0x9f6b6f8896227FA8bB7E8240e5810755397E0B86'
const genesisPool = '0x72dBdb9Bf4AADD8444453053Dd7cB77fd019c69a'

const lps = ['0x2B032AEf6519D445414c24eaAB665CdD6404cB20' , // LP BURGER/WWDOGE
             '0x0C9bC71CFE0cCAd3EdF5968b9fC3ce0b7B38F537', // LP FRIES/WWDOGE
            ]

module.exports = unknownTombs({
  lps,
  token: burgerAddress,
  shares: [friesAddress],
  chain,
  useDefaultCoreAssets: true,
})

module.exports[chain].tvl = sumTokensExport({ chain, owner: genesisPool, tokens: [
  '0x7B4328c127B85369D9f82ca0503B000D09CF9180',
  '0x765277EebeCA2e31912C9946eAe1021199B39C61',
  '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
], useDefaultCoreAssets: true, })
module.exports.misrepresentedTokens = true
