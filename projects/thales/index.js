const { staking } = require('../helper/staking')
const { sumChainTvls } = require('@defillama/sdk/build/generalUtil')
const CHAIN_CONFIG = require('./chainConfig')
const helpers = require('./utils')

// Create module for each chain
const createChainModule = (chain) => {
  const config = CHAIN_CONFIG[chain]
  const module = {
    tvl: (api) => helpers.calculateChainTVL(api, chain)
  }

  if (config.pool2) {
    module.pool2 = (api) => helpers.calculatePool2TVL(api, chain)
  }

  module.staking = (api) => sumChainTvls([
    config.stakingPools ? helpers.calculateStakingTVL(api, chain) : {}, 
    config.staking ? staking(config.staking.contract, config.staking.token) : {}
  ])

  return module
}

module.exports = {
  methodology: "Calculate TVL for liquidity pools, active markets, speed markets, staking and pool2",
  optimism: createChainModule('optimism'),
  arbitrum: createChainModule('arbitrum'),
  polygon: createChainModule('polygon'),
  base: createChainModule('base'),
  ethereum: {tvl: async ()=>({})},
  bsc: {tvl: async ()=>({})},
}