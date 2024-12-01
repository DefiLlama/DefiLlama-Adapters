const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('./abi.json')
const CHAIN_CONFIG = require('./chainConfig')

const utils = {
  // Get token address from chain config
  getTokenAddress: (chain, symbol) => CHAIN_CONFIG[chain].tokens[symbol],

  // Add LP TVL
  addLPTvl: async (api, contract, token) => {
    const tokenAddress = utils.getTokenAddress(api.chain, token)
    api.add(tokenAddress, await api.call({
      target: contract,
      abi: abi.totalDeposited
    }))
  },

  // Get markets from manager
  getMarketsFromManager: async (api, manager, abiMethod) => {
    return api.call({
      target: manager,
      abi: abi[abiMethod],
      params: [0, 1000]
    })
  },

  // Get all markets for a chain
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

  // Calculate chain TVL
  calculateChainTVL: async (api, chain) => {
    const config = CHAIN_CONFIG[chain]

    // Add LP TVLs
    for (const poolType in config.liquidityPools || {}) {
      for (const pool of config.liquidityPools[poolType]) {
        await utils.addLPTvl(api, pool.address, pool.token)
      }
    }

    // Get all markets
    const markets = [
      ...await utils.getAllMarkets(api, chain),
      ...(config.speedMarkets || [])
    ]

    // Calculate TVL for all markets and tokens
    return sumTokens2({
      api,
      owners: markets,
      tokens: Object.values(config.tokens)
    })
  }
}

module.exports = utils
