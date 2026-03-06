const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const { defaultTokens } = require('../helper/cex')
const { getConfig } = require('../helper/cache.js')

const API_URL = 'https://api.backpack.exchange/api/v1/wallets'

const _getConfig = async () => {
  const data = await getConfig('backpack/wallets', API_URL)
  const config = {}
  data.forEach(({ address, blockchain }) => {
    let chain = blockchain.toLowerCase()
    if (chain === 'avalanche') chain = 'avax'
    if (!config[chain]) config[chain] = { owners: [] }
    config[chain].owners.push(address)
  })
  return config
}

const exportObj = { timetravel: false }
const CHAINS = [
  'solana',
  'ethereum',
  'bitcoin',
  'doge',
  'litecoin',
  'arbitrum',
  'base',
  'bsc',
  'optimism',
  'avax',
  'polygon',
  'tron',
  'aptos',
  'ripple',
  'plasma',
  'hyperliquid'
]

const CHAIN_BLACKLISTS = {
  ethereum: [ADDRESSES.ethereum.sUSD_OLD],
}

CHAINS.forEach((chain) => {
  exportObj[chain] = {
    tvl: async () => {
      const config = await _getConfig()
      const entry = config[chain]
      if (!entry) return {}

      const tokenLists = [...new Set([
        ...(Object.values(ADDRESSES[chain] || {})),
        ...(defaultTokens[chain] || []),
      ])]

      let { tokensAndOwners, owners, tokens, blacklistedTokens = [], fungibleAssets } = entry

      if (!tokensAndOwners && !tokens) tokens = tokenLists

      if (CHAIN_BLACKLISTS[chain]) {
        blacklistedTokens = [
          ...new Set([...(blacklistedTokens || []), ...CHAIN_BLACKLISTS[chain]]),
        ]
      }

      const options = { ...entry, owners, tokens, chain, blacklistedTokens }

      switch (chain) {
        case 'solana': options.includeStakedSol = true
        case 'eclipse': options.solOwners = owners; break
        case 'ton': options.onlyWhitelistedTokens = true; break
        case 'aptos':
          if (Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets
          break
      }
      return sumTokensExport(options)()
    }
  }
})

module.exports = exportObj
