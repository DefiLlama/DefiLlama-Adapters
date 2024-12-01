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
    liquidityPools: {
      sports: [
        { address: CONTRACTS.arbitrum.SPORTS_POOLS.USDC, token: 'USDC' },
        { address: CONTRACTS.arbitrum.SPORTS_POOLS.WETH, token: 'WETH' },
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
    liquidityPools: {
      digitalOptions: [
        { address: CONTRACTS.base.DIGITAL_POOLS.USDC, token: 'USDC' }
      ]
    }
  }
}

module.exports = CHAIN_CONFIG
