const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPriceLP } = require('../helper/staking')

module.exports =  {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x0ed713989f421ff6f702b2e4e1c93b1bb9002119', }),
    staking: stakingPriceLP('0x9db65123aa185811e50f8b626a7d4799c39ea4d5', '0xf33893de6eb6ae9a67442e066ae9abd228f5290c', '0xe27f915a8a9ca6c31b193311ae76b8738b926d17'),
  },
  ethereum: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x6c565c5bbdc7f023cae8a2495105a531caac6e54', }),
  },
  grove: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x401e7e28e0C679E1a3242ac6CD93C9c56208A260', }),
  }
}