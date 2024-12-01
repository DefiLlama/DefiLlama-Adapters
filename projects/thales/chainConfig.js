const CHAIN_TOKENS = require('./addresses')
const CONTRACTS = require('./constants')

const CHAIN_CONFIG = {
  optimism: {
    tokens: CHAIN_TOKENS.optimism,
    pool2: {
      lpToken: CONTRACTS.optimism.LP_TOKEN,
      baseToken: CHAIN_TOKENS.optimism.THALES,
      pairedToken: CHAIN_TOKENS.optimism.ETH
    },
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
    pool2: {
      lpToken: CONTRACTS.arbitrum.LP_TOKEN,
      baseToken: CHAIN_TOKENS.arbitrum.THALES,
      pairedToken: CHAIN_TOKENS.arbitrum.WETH
    },
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
    pool2: {
      lpToken: CONTRACTS.base.LP_TOKEN,
      baseToken: CHAIN_TOKENS.base.THALES,
      pairedToken: CHAIN_TOKENS.base.WETH
    },
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
