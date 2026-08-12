const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  base: {
    // Aave strategies: track aToken balances directly
    aaveStrategies: [
      ['0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', '0xc91E44E9302288FE5Df24d6392875E5069E1aca7'], // aBasUSDC held by Aave V3 USDC strategy
    ],
    // Monarq strategies: no discoverable yield token, use ERC4626 totalAssets
    erc4626Strategies: [
      '0xe83EF4375d806c02387069f1b753b2ab76ab1dc5', // Monarq USDC Lender
      '0x1A48Cec817Bcb5436EFE99BAb6dDe228Cc37e1Cc', // Monarq USDT Lender
    ],
    // Idle funds in strategy managers
    idleFunds: [
      [ADDRESSES.base.USDC, '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374'],  // USDC SM
      [ADDRESSES.base.USDT, '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94'],  // USDT SM
    ],
  },
  ethereum: {
    aaveStrategies: [
      ['0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', '0x28966Ce36d0F25858dc5d10DfC2829F05C332C49'], // aEthUSDC held by Aave V3 USDC strategy
      ['0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', '0x6424c7548e214f89B64Ea5981c5A0c5Ec22b6e38'], // aEthUSDT held by Aave V3 USDT strategy
    ],
    erc4626Strategies: [],
    idleFunds: [],
  },
}

Object.keys(config).forEach(chain => {
  const { aaveStrategies, erc4626Strategies, idleFunds } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // Track aToken balances directly for Aave strategies
      const tokensAndOwners = [...aaveStrategies, ...idleFunds]

      // Use ERC4626 totalAssets for Monarq strategies (mapped to underlying USDC/USDT)
      if (erc4626Strategies.length)
        await api.erc4626Sum({ calls: erc4626Strategies, isOG4626: true })

      return sumTokens2({ api, tokensAndOwners })
    }
  }
})

module.exports.doublecounted = true
