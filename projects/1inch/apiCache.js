const abi = require("../mooniswap/abi.json");
const config = require("./config")
const { sumTokens2, } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { createIncrementArray } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache");

const project = 'bulky/1inch'

module.exports = {}
Object.keys(config).forEach(chain => {
  const { MooniswapFactory, blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const cache = await getCache(project, chain) || { pools: {} }
      if (!cache.pools) cache.pools = {}
      const toa = []
      const pools = []
      const length = 5
      
      let i = cache.lastI || Math.floor(Object.keys(cache.pools).length / length)
      let currentPools
      do {
        const { output: data } = await sdk.api.abi.multiCall({
          target: MooniswapFactory,
          abi: abi.getPool,
          calls: createIncrementArray(length).map(j => ({ params: j + i * length })),
          chain, block,
        })
        currentPools = data.map(i => i.output).filter(i => i)
        pools.push(...currentPools)
        i++
      } while (currentPools.length === length)

      cache.lastI = i-1
      const calls = pools.map(i => ({ target: i }))
      const { output: tokensAll } = await sdk.api.abi.multiCall({
        abi: abi.getTokens,
        calls, chain, block,
      })

      tokensAll.forEach(({ output: tokens, input: { target: pool } }) => {
        cache.pools[pool.toLowerCase()] = tokens
      })
      
      for (const [pool, tokens] of Object.entries(cache.pools))
        tokens.forEach(i => toa.push([i, pool]))

      await setCache(project, chain, cache)
      return sumTokens2({ chain, block, tokensAndOwners: toa, blacklistedTokens, })
    }
  }
})