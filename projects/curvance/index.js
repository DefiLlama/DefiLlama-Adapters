const { sumTokens2 } = require('../helper/unwrapLPs')
const config = {
  monad: '0x1310f352f1389969Ece6741671c4B919523912fF'
}

Object.keys(config).forEach(chain => {
  const centralRegistry = config[chain]

  async function getMarkets(api) {
    const managers = await api.call({ abi: 'address[]:marketManagers', target: centralRegistry })
    const markets = await api.multiCall({ abi: 'address[]:queryTokensListed', calls: managers })
    return markets.flat()
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const contracts = await getMarkets(api)
      const tokens = await api.multiCall({ abi: 'address:asset', calls: contracts })
      return sumTokens2({ api, tokensAndOwners2: [tokens, contracts] })
    },
    borrowed: async (api) => {
      const contracts = await getMarkets(api)
      const tokens = await api.multiCall({ abi: 'address:asset', calls: contracts })
      const bals = await api.multiCall({ abi: 'uint256:marketOutstandingDebt', calls: contracts })
      api.add(tokens, bals)
      return sumTokens2({ api, })
    }
  }
})