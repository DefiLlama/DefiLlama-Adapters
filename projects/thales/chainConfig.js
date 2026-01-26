const CHAIN_TOKENS = require('./addresses')
const CONTRACTS = require('./constants')

const CHAIN_CONFIG = {
  optimism: {
    tokens: CHAIN_TOKENS.optimism,
    staking: {
      contract: CONTRACTS.optimism.STAKING_CONTRACT,
      token: CHAIN_TOKENS.optimism.THALES
    },
    speedMarkets: CONTRACTS.optimism.SPEED_MARKETS,
    managers: CONTRACTS.optimism.MANAGERS,
    pool2: {
      lpTokens: CONTRACTS.optimism.LP_TOKEN
    },
    stakingPools: [
      { address: CONTRACTS.optimism.SPORTS_POOLS.OVERTIME, token: 'OVERTIME' }
    ],
    liquidityPools: {
      sports: [
        { address: CONTRACTS.optimism.SPORTS_POOLS.USDC, token: 'USDC' },
        { address: CONTRACTS.optimism.SPORTS_POOLS.WETH, token: 'WETH' },
        { address: CONTRACTS.optimism.SPORTS_POOLS.THALES, token: 'THALES' }
      ],
      digitalOptions: [
        { address: CONTRACTS.optimism.DIGITAL_POOLS.USDC, token: 'USDC' }
      ]
    }
  },
  arbitrum: {
    tokens: CHAIN_TOKENS.arbitrum,
    staking: {
      contract: CONTRACTS.arbitrum.STAKING_CONTRACT,
      token: CHAIN_TOKENS.arbitrum.THALES
    },
    speedMarkets: CONTRACTS.arbitrum.SPEED_MARKETS,
    managers: CONTRACTS.arbitrum.MANAGERS,
    pool2: {
      lpTokens: CONTRACTS.arbitrum.LP_TOKEN
    },
    stakingPools: [
      { address: CONTRACTS.arbitrum.SPORTS_POOLS.OVERTIME, token: 'OVERTIME' }
    ],
    liquidityPools: {
      sports: [
        { address: CONTRACTS.arbitrum.SPORTS_POOLS.USDC, token: 'USDC' },
        { address: CONTRACTS.arbitrum.SPORTS_POOLS.WETH, token: 'WETH' },
        { address: CONTRACTS.arbitrum.SPORTS_POOLS.WBTC, token: 'WBTC' },
        { address: CONTRACTS.arbitrum.SPORTS_POOLS.THALES, token: 'THALES' }
      ],
      digitalOptions: [
        { address: CONTRACTS.arbitrum.DIGITAL_POOLS.USDC, token: 'USDC' }
      ]
    }
  },
  polygon: {
    tokens: CHAIN_TOKENS.polygon,
    speedMarkets: CONTRACTS.polygon.SPEED_MARKETS
  },
  base: {
    tokens: CHAIN_TOKENS.base,
    staking: {
      contract: CONTRACTS.base.STAKING_CONTRACT,
      token: CHAIN_TOKENS.base.THALES
    },
    speedMarkets: CONTRACTS.base.SPEED_MARKETS,
    managers: CONTRACTS.base.MANAGERS,
    pool2: {
      lpTokens: CONTRACTS.base.LP_TOKEN
    },
    stakingPools: [
      { address: CONTRACTS.base.SPORTS_POOLS.OVERTIME, token: 'OVERTIME' }
    ],
    liquidityPools: {
      sports: [
        { address: CONTRACTS.base.SPORTS_POOLS.USDC, token: 'USDC' },
        { address: CONTRACTS.base.SPORTS_POOLS.WETH, token: 'WETH' },
        { address: CONTRACTS.base.SPORTS_POOLS.cbBTC, token: 'cbBTC' }
      ],
      digitalOptions: [
        { address: CONTRACTS.base.DIGITAL_POOLS.USDC, token: 'USDC' }
      ]
    }
  },
  ethereum: {
    tokens: CHAIN_TOKENS.ethereum,
  }
}

module.exports = CHAIN_CONFIG