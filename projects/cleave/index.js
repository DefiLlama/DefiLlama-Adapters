const config = {
  ethereum: { factory: '0x86a64e50092155cfe63cedeba4e7cd29bf495921', },
}

Object.keys(config).forEach(chain => {
  const { factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const series = await api.fetchList({  lengthAbi: 'seriesCount', itemAbi: 'series', target: factory})
      const tokens = await api.multiCall({  abi:'address:collateralToken' , calls: series })
      return api.sumTokens({ tokensAndOwners2: [tokens, series]})
    }
  }
})