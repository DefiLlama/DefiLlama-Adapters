// https://wildcat-protocol.gitbook.io/wildcat/technical-deep-dive/contract-deployments
const config = {
  ethereum: { archController: '0xfEB516d9D946dD487A9346F6fee11f40C6945eE4', },
  // sepolia: { archController: '0xC003f20F2642c76B81e5e1620c6D8cdEE826408f', },
}

Object.keys(config).forEach(chain => {
  const { archController } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { markets, tokens } = await getMarkets(api)
      return api.sumTokens({ tokensAndOwners2: [tokens, markets] })
    },
    borrowed: async (api) => {
      const { markets, tokens } = await getMarkets(api)
      const debts = await api.multiCall({ abi: 'uint256:totalDebts', calls: markets })
      const assets = await api.multiCall({ abi: 'uint256:totalAssets', calls: markets })
      tokens.forEach((token, i) => {
        const bal = debts[i] - assets[i]
        if (bal > 0)
          api.add(token, bal)
      })
      return api.getBalances()
    }
  }

  async function getMarkets(api) {
    const markets = await api.call({ abi: 'address[]:getRegisteredMarkets', target: archController })
    const tokens = await api.multiCall({ abi: 'address:asset', calls: markets })
    return { markets, tokens }
  }
})