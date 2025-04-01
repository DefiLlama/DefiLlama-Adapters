const { staking } = require('../helper/staking')
const CHAIN_CONFIG = require('./chainConfig')
const helpers = require('./utils')

// Create module for each chain
const createChainModule = (chain) => {
  const config = CHAIN_CONFIG[chain]
  const module = {
    tvl: (api) => helpers.calculateChainTVL(api, chain)
  }

  // Add staking if configured
  if (config.staking) {
    module.staking = staking(
      config.staking.contract,
      config.staking.token
    )
  }

  return module
}

// Export configuration for each chain
module.exports = {
  methodology: "Calculate TVL for liquidity pools, markets, staking and pool2",
  optimism: createChainModule('optimism'),
  arbitrum: createChainModule('arbitrum'),
  polygon: createChainModule('polygon'),
  base: createChainModule('base'),
  ethereum: {tvl: async ()=>({})},
  bsc: {tvl: async ()=>({})},
}
