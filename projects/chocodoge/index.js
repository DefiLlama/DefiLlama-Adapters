const { getUniTVL, staking, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const uscdAddress = '0x06AcD60e5B1CD9aB7E4beBfaA1233D3cCe97A08F'
const cdAddress = '0x51bB8f9a2A10c550DD149A9a48d8c4E8c59F4f56'

const lps = ['0x44A46907f145173F1841B1a3E258FbBEB68608E8' , // LP USCD/USDC
             '0x32138fFD6d2B30f7b7295E32Cd9A19A7A590532E', // LP CD/USDC
             '0x68609eA0b8393258d0d7EF21401E1Cd3B00A714e', // LP USCD/DOGE
            ]

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain, useDefaultCoreAssets: true,
      factory: '0xF4bc79D32A7dEfd87c8A9C100FD83206bbF19Af5',
    }),
    staking: staking({
      chain, useDefaultCoreAssets: true,
      owner: '0x8ffBD442F246964A0d2E87C9b2551095bdA6EEb3',
      tokens: [uscdAddress, cdAddress],
      lps,
     })
  }
}
