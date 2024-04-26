const sdk = require('@defillama/sdk')
const { createIncrementArray } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')
const token0ABI = 'address:token0'
const token1ABI = 'address:token1'

const abis = {
  poolsCount: "uint256:poolsCount",
  poolsAddresses: "function poolsAddresses(uint256) view returns (address)",
}

const config = {
  bsc: {
    positionManager: '0x9df9de5ed89adbbd9fa2c14691903a0de9048a87',
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  const { positionManager } = config[chain]
  module.exports[chain] = {
    tvl: async function tvl(_, _b, { [chain]: block }) {

      const { output: poolCount } = await sdk.api.abi.call({
        target: positionManager,
        abi: abis.poolsCount,
        chain, block,
      })
      const calls = createIncrementArray(poolCount).map(i => ({ params: i }))
      let { output: poolAddreses } = await sdk.api.abi.multiCall({
        target: positionManager,
        abi: abis.poolsAddresses,
        calls,
        chain, block,
      })

      poolAddreses = poolAddreses.map(i => ({ target: i.output }))
      const { output: token0s } = await sdk.api.abi.multiCall({
        abi: token0ABI,
        calls: poolAddreses,
        chain, block,
      })
      const { output: token1s } = await sdk.api.abi.multiCall({
        abi: token1ABI,
        calls: poolAddreses,
        chain, block,
      })
      const toa = []
      token0s.forEach(({ input: { target }, output }) => toa.push([output, target]))
      token1s.forEach(({ input: { target }, output }) => toa.push([output, target]))
      return sumTokens2({ chain, block, tokensAndOwners: toa })
    }
  }
})
