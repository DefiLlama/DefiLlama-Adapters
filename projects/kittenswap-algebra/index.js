const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const POOL_EVENT = 'event Pool (address indexed token0, address indexed token1, address pool)'
const CUSTOM_POOL_EVENT = 'event CustomPool (address indexed deployer, address indexed token0, address indexed token1, address pool)'

const config = {
  hyperliquid: { factory: '0x5f95E92c338e6453111Fc55ee66D4AafccE661A7', fromBlock: 11022081, blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb'] },
  robinhood: { factory: '0xf03875b5Ec5eAc83cab83A6c2ab17844304AA7a0', fromBlock: 54162498 },
}

module.exports = {
  methodology: 'Counts the tokens held by every Kittenswap Algebra pool, standard and custom, discovered from the factory Pool and CustomPool events.',
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, blacklistedTokens = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const [pools, customPools] = await Promise.all([
        getLogs2({ api, factory, fromBlock, eventAbi: POOL_EVENT, extraKey: 'standard-pool' }),
        getLogs2({ api, factory, fromBlock, eventAbi: CUSTOM_POOL_EVENT, extraKey: 'custom-pool' }),
      ])
      // a custom pool can also emit Pool, so dedupe by address
      const ownerTokens = {}
      for (const { token0, token1, pool } of [...pools, ...customPools]) ownerTokens[pool.toLowerCase()] = [[token0, token1], pool]
      return sumTokens2({ api, ownerTokens: Object.values(ownerTokens), blacklistedTokens })
    },
  }
})
