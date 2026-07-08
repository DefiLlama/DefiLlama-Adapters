const { sumTokens2 } = require('../helper/unwrapLPs')
const VAULT_MARKET_NAME_SUFFIX = ' vault'

const config = {
  monad: {
    centralRegistry: '0x1310f352f1389969Ece6741671c4B919523912fF',
    blcklistedMarkets: [
      // eBTC market is permanently disabled on Monad after their private key exploit on May 30th.
      // Do not re-add this market.
      '0x2840772E14fFbe337aB966727B7D1Dd09BDc76E4',
    ],
  },
}

Object.keys(config).forEach(chain => {
  const centralRegistry = config[chain].centralRegistry
  const blcklistedMarkets = config[chain].blcklistedMarkets.map(m => String(m).toLowerCase())

  function isVaultMarketName(name) {
    return String(name || '').toLowerCase().endsWith(VAULT_MARKET_NAME_SUFFIX)
  }

  async function getOptimizerVaultMarkets(api, markets) {
    const names = await api.multiCall({ abi: 'string:name', calls: markets, permitFailure: true })
    const vaultNamedMarkets = markets.filter((_, i) => isVaultMarketName(names[i]))
    if (!vaultNamedMarkets.length) return []

    const vaults = await api.multiCall({ abi: 'address:asset', calls: vaultNamedMarkets })
    const numApprovedMarkets = await api.multiCall({ abi: 'uint256:numApprovedMarkets', calls: vaults, permitFailure: true })
    return vaultNamedMarkets.filter((_, i) => Number(numApprovedMarkets[i] || 0) > 0)
  }

  async function getListedMarkets(api) {
    const managers = await api.call({ abi: 'address[]:marketManagers', target: centralRegistry })
    const markets = await api.multiCall({ abi: 'address[]:queryTokensListed', calls: managers })
    const uniqueMarkets = [...new Map(markets.flat().map(m => [String(m).toLowerCase(), m])).values()]
    return uniqueMarkets.filter(m => !blcklistedMarkets.includes(String(m).toLowerCase()))
  }

  async function getVaults(api) {
    const markets = await getListedMarkets(api)
    const vaultMarkets = await getOptimizerVaultMarkets(api, markets)
    const vaults = await api.multiCall({ abi: 'address:asset', calls: vaultMarkets })
    return [...new Map(vaults.map(v => [String(v).toLowerCase(), v])).values()]
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = await getVaults(api)
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
      const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: vaults })
      const balances = await api.multiCall({
        abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
        calls: vaults.map((target, i) => ({ target, params: [supplies[i]] })),
      })
      api.add(tokens, balances)
      return sumTokens2({ api })
    },
  }
})

module.exports.doublecounted = true
