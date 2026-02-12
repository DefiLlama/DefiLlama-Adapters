const config = {
  ethereum: { factory: '0x44b7fbd4d87149efa5347c451e74b9fd18e89c55', },
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = { tvl }

  async function tvl(api) {
    const pools = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory })
    const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
    const tokensAndOwners2 = [token0s.concat(token1s), pools.concat(pools)]
    return api.sumTokens({ tokensAndOwners2, })
  }
})