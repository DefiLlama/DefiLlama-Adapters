
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
  kava: {
    positionManager: '0x1Bf12f0650d8065fFCE3Cd9111feDEC21deF6825',
  },
  aurora: {
    positionManager: '0x649Da64F6d4F2079156e13b38E95ffBF8EBB1B14',
  },
  polygon: {
    positionManager: '0xc130807A61D5fE62F2cE3A38B14c61D658CE73F3',
  },
  bsc: {
    positionManager: '0x4eDeDaDFc96E44570b627bbB5c169d91304cF417',
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

