// https://wildcat-protocol.gitbook.io/wildcat/technical-deep-dive/contract-deployments
const config = {
  ethereum: { archController: '0xfEB516d9D946dD487A9346F6fee11f40C6945eE4', },
  // sepolia: { archController: '0xC003f20F2642c76B81e5e1620c6D8cdEE826408f', },
}

Object.keys(config).forEach(chain => {
  const { archController } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const { markets, tokens} = await getMarkets(api)
      return api.sumTokens({ tokensAndOwners2: [tokens, markets]})
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const { markets, tokens} = await getMarkets(api)
      const debts = await api.multiCall({  abi: 'uint256:delinquentDebt', calls: markets})
      api.addTokens(tokens, debts)
      return api.getBalances()
    }
  }

  async function getMarkets(api) {
    const markets = await api.call({  abi: 'address[]:getRegisteredMarkets', target: archController})
    const tokens = await api.multiCall({  abi: 'address:asset', calls: markets})
    return { markets, tokens }
  }
})