const { sumTokens2, } = require('./helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { createIncrementArray } = require('./helper/utils')

const abi = require("./mooniswap/abi.json");
const config = require("./1inch/config");

module.exports = {}
const minIndexes = {
  ethereum: 30,
  bsc: 136,
}

Object.keys(config).forEach(chain => {
  const { MooniswapFactory, blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const toa = []
      const pools = []
      const length = 10
      let i = minIndexes[chain]

      const { output: data1 } = await sdk.api.abi.multiCall({
        target: MooniswapFactory,
        abi: abi.getPool,
        calls: createIncrementArray(i * length).map(j => ({ params: j})),
        chain, block,
      })
      pools.push(...data1.map(i => i.output))
      let currentPools
      do {

        const { output: data } = await sdk.api.abi.multiCall({
          target: MooniswapFactory,
          abi: abi.getPool,
          calls: createIncrementArray(length).map(j => ({ params: j + i*length})),
          chain, block,
        })
        currentPools = data.map(i => i.output).filter(i => i)
        pools.push(...currentPools)
        i++
      } while(currentPools.length === length)

      const calls = pools.map(i => ({ target: i }))
      const { output: tokensAll } = await sdk.api.abi.multiCall({
        abi: abi.getTokens,
        calls, chain, block,
      })

      tokensAll.forEach(({ output: tokens, input: { target: pool } }) => {
        tokens.forEach(i => toa.push([i, pool]))
      })

      return sumTokens2({ chain, block, tokensAndOwners: toa, blacklistedTokens, })
    }
  }
})