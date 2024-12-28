const config = {
  arbitrum: { pools: ['0x9Be2Cf73E62DD3b5dF4334D9A36888394822A33F'] },
  base: { pools: ['0x1bE87D273d47C3832Ab7853812E9A995A4DE9EEA'] },
}

Object.keys(config).forEach(chain => {
  const { pools, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const cTokens = await api.multiCall({ abi: 'address:contractCoin', calls: pools })
      const sTokens = await api.multiCall({ abi: 'address:stablecoin', calls: pools })
      const tokens = cTokens.concat(sTokens)
      const owners = pools.concat(pools)
      return api.sumTokens({ tokensAndOwners2: [tokens, owners] })
    }
  }
})