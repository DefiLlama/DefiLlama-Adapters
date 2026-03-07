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
    if (chain === 'hyperevm') chain = 'hyperliquid'
    if (chain === 'dogecoin') chain = 'doge'
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
  'fogo',
  'stable',
  'monad',
  'hyperliquid',
]

const CHAIN_BLACKLISTS = {
  ethereum: [ADDRESSES.ethereum.sUSD_OLD],
}

CHAINS.forEach((chain) => {
  exportObj[chain] = {
    tvl: async (api) => {
      const config = await _getConfig()
      const entry = config[chain]
      if (!entry) return {}

      const tokens = [
        ...(Object.values(ADDRESSES[chain] || {})),
        ...(defaultTokens[chain] || []),
      ]

      let { owners, fungibleAssets } = entry


      const options = { owners, tokens, chain, blacklistedTokens: CHAIN_BLACKLISTS[chain] }

      switch (chain) {
        case 'solana':
          options.includeStakedSol = true;
          options.onlyTrustedTokens = true;
        case 'fogo':
        case 'eclipse':
          options.solOwners = options.owners;
          options.tokens = undefined
          break;
        case 'ton': options.onlyWhitelistedTokens = true; break
        case 'aptos':
          if (Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets
          break
      }
      return sumTokensExport(options)(api)
    }
  }
})

module.exports = exportObj
