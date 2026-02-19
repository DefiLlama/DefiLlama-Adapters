const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const STRATEGY_MANAGERS = {
  USDC: '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374',
  USDT: '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94',
}

const config = {
  base: {
    strategies: [
      '0xc91E44E9302288FE5Df24d6392875E5069E1aca7', // USDC Aave V3
      '0xe83EF4375d806c02387069f1b753b2ab76ab1dc5', // USDC Monarq
      '0x1A48Cec817Bcb5436EFE99BAb6dDe228Cc37e1Cc', // USDT Monarq
    ],
  },
  ethereum: {
    strategies: [
      '0x28966Ce36d0F25858dc5d10DfC2829F05C332C49', // USDC Aave V3
      '0x6424c7548e214f89B64Ea5981c5A0c5Ec22b6e38', // USDT Aave V3
    ],
  },
}

Object.keys(config).forEach(chain => {
  const { strategies } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await api.erc4626Sum({ calls: strategies, isOG4626: true })
      const tokensAndOwners = Object.entries(STRATEGY_MANAGERS).map(
        ([symbol, manager]) => [ADDRESSES[chain][symbol], manager]
      )
      return sumTokens2({ api, tokensAndOwners })
    }
  }
})

module.exports.doublecounted = true
