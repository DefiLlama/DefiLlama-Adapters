const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const CHAIN_CONFIG = require('./chainConfig')

const utils = {
  getTokenAddress: (chain, symbol) => CHAIN_CONFIG[chain].tokens[symbol],

  addLPTvl: async (api, contract, token) => {
    const tokenAddress = utils.getTokenAddress(api.chain, token)
    
    const currentRound = await api.call({
      target: contract,
      abi: abi.round
    })
    
    const roundPoolAddress = await api.call({
      target: contract,
      abi: abi.roundPools,
      params: [currentRound]
    })
    
    const poolBalance = await api.call({
      target: tokenAddress,
      abi: 'erc20:balanceOf',
      params: [roundPoolAddress]
    })
    
    api.add(tokenAddress, poolBalance)
  },

  getMarketsFromManager: async (api, manager, abiMethod) => {
    return api.call({
      target: manager,
      abi: abi[abiMethod],
      params: [0, 1000]
    })
  },

  getAllMarkets: async (api, chain) => {
    const config = CHAIN_CONFIG[chain]
    if (!config.managers) return []

    const [digitalMarkets, sportsMarkets] = await Promise.all([
      Promise.all((config.managers.digital || []).map(manager =>
        utils.getMarketsFromManager(api, manager, 'activeMarkets')
      )),
      Promise.all((config.managers.sports || []).map(manager =>
        utils.getMarketsFromManager(api, manager, 'getActiveTickets')
      ))
    ])

    return [...digitalMarkets.flat(), ...sportsMarkets.flat()]
  },

  calculatePool2TVL: async (api, chain) => {
    const config = CHAIN_CONFIG[chain]
    if (!config.pool2) return {}

    const lpTokens = config.pool2.lpTokens || []
    
    return sumTokens2({
      api,
      owners: lpTokens,
      tokens: Object.values(config.tokens),
      resolveLP: true
    })
  },

  calculateStakingTVL: async (api, chain) => {
    const config = CHAIN_CONFIG[chain]
    if (!config.stakingPools) return {}

    for (const pool of config.stakingPools) {
      await utils.addLPTvl(api, pool.address, pool.token)
    }

    return api.getBalances()
  },

  calculateChainTVL: async (api, chain) => {
    const config = CHAIN_CONFIG[chain]

    for (const poolType in config.liquidityPools || {}) {
      for (const pool of config.liquidityPools[poolType]) {
        await utils.addLPTvl(api, pool.address, pool.token)
      }
    }

    const markets = [
      ...await utils.getAllMarkets(api, chain),
      ...(config.speedMarkets || [])
    ]

    const validTokens = Object.values(config.tokens).filter(token => 
      token && token !== '0x0' && token.length > 2
    )

    return sumTokens2({
      api,
      owners: markets,
      tokens: validTokens
    })
  }
}

module.exports = utils