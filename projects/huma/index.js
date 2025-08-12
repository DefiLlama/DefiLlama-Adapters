const abiPool = {
  "checkPool": "function checkPool(uint256 poolId_) view returns ((uint256 poolId, address poolAddress, string poolName, uint8 poolStatus, address poolConfigAddress, address poolTimelock))",
}

const config = {
  celo: {
    factory: '0x85c8dC49B8DaA709e65dd2182e500E8AC3CaA6C7',
    v1Pools: ['0xa190a0ab76f58b491cc36205b268e8cf5650c576'],
  },
  polygon: {
    v1Pools: ['0xe8926adbfadb5da91cd56a7d5acc31aa3fdf47e5', '0x95533e56f397152b0013a39586bc97309e9a00a7', '0x3EBc1f0644A69c565957EF7cEb5AEafE94Eb6FcE'],
  }
}

module.exports = {
  methodology: 'sum all tvls from all pools',
  start: '2024-05-21', //2023-05-01
}

Object.keys(config).forEach(chain => {
  const { factory, v1Pools, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const allTokens = []
      const allOwners = []
      const v1Data = await api.multiCall({  abi: 'function getCoreData() view returns (address uToken, address, address, address)', calls: v1Pools})
      allTokens.push(...v1Data.map(i => i.uToken))
      allOwners.push(...v1Pools)

      if (factory) {
        const poolData = await api.fetchList({  lengthAbi: 'poolId', itemAbi: abiPool.checkPool, target: factory, startFromOne: true})
        const pools = poolData.filter(p => p.poolStatus === '1').map(p => p.poolAddress)
        const poolConfigs = await api.multiCall({  abi: 'address:poolConfig', calls: pools})
        const tokens = await api.multiCall({  abi: 'address:underlyingToken', calls: poolConfigs})
        const owners = await api.multiCall({  abi: 'address:poolSafe', calls: pools})
        allTokens.push(...tokens)
        allOwners.push(...owners)
      }
      return api.sumTokens({ tokensAndOwners2: [allTokens, allOwners] })
    },
    borrowed: async (api) => {
      const allTokens = []
      const allOwners = []
      const v1Data = await api.multiCall({  abi: 'function getCoreData() view returns (address uToken, address, address, address)', calls: v1Pools})
      const v1Bals = await api.multiCall({  abi: 'uint256:totalPoolValue', calls: v1Pools})
      api.add(v1Data.map(i => i.uToken), v1Bals)
      allTokens.push(...v1Data.map(i => i.uToken))
      allOwners.push(...v1Pools)

      if (factory) {
        const poolData = await api.fetchList({  lengthAbi: 'poolId', itemAbi: abiPool.checkPool, target: factory, startFromOne: true})
        const pools = poolData.filter(p => p.poolStatus === '1').map(p => p.poolAddress)
        const poolConfigs = await api.multiCall({  abi: 'address:poolConfig', calls: pools})
        const tokens = await api.multiCall({  abi: 'address:underlyingToken', calls: poolConfigs})
        const bals = await api.multiCall({  abi: 'uint256:totalAssets', calls: pools})
        api.add(tokens, bals)
        const owners = await api.multiCall({  abi: 'address:poolSafe', calls: pools})
        allTokens.push(...tokens)
        allOwners.push(...owners)
      }

      const calls = allTokens.map((t, i) => ({ target: t, params: allOwners[i] }))
      const tokenBals = (await api.multiCall({  abi: 'erc20:balanceOf', calls, })).map(i => i * -1) // subtract token balance in pools
      api.add(allTokens, tokenBals)
    }
  }
})