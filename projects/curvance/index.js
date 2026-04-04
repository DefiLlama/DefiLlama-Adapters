const { sumTokens2 } = require('../helper/unwrapLPs')
const config = {
  monad: {
    centralRegistry: '0x1310f352f1389969Ece6741671c4B919523912fF',
    blcklistedMarkets: [
      // single source of deposit and no borrowers
      // from this address: 0x8da30b68b1e11761e1307eb10564a39e01ae4480 created multiple Safe wallets and made deposits
      '0x2840772E14fFbe337aB966727B7D1Dd09BDc76E4',
    ],
  },
}

Object.keys(config).forEach(chain => {
  const centralRegistry = config[chain].centralRegistry
  const blcklistedMarkets = config[chain].blcklistedMarkets.map(m => String(m).toLowerCase())

  async function getMarkets(api) {
    const managers = await api.call({ abi: 'address[]:marketManagers', target: centralRegistry })
    const markets = await api.multiCall({ abi: 'address[]:queryTokensListed', calls: managers })
    return markets.flat().filter(m => !blcklistedMarkets.includes(String(m).toLowerCase()))
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const contracts = await getMarkets(api)
      console.log(contracts)
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