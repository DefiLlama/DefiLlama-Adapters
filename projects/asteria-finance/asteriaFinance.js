function asteriaFinanceExport(config) {
  const exports = {
    methodology: 'We count the token balances in in different liquidity book contracts',
  }

  Object.keys(config).forEach(chain => {
    let { factory } = config[chain]

    exports[chain] = {
      tvl: async (api) => {
        const pools = await api.fetchList({ target: factory, itemAbi: 'getLBPairAtIndex', lengthAbi: 'getNumberOfLBPairs', })
        const tokenA = await api.multiCall({ abi: 'address:getTokenX', calls: pools, })
        const tokenB = await api.multiCall({ abi: 'address:getTokenY', calls: pools, })
        const tokensAndOwners2 = [tokenA.concat(tokenB), pools.concat(pools)]
        return api.sumTokens({ tokensAndOwners2 })
      }
    }
  })

  return exports
}


module.exports = {
  asteriaFinanceExport,
}