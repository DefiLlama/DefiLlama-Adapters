const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')
const { defaultTokens } = require('../helper/cex')
const { getConfig } = require('../helper/cache.js')
const { getStakedSol } = require('../helper/solana')

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
  ethereum: ['0x57ab1e02fee23774580c119740129eac7081e9d3'],
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
      if (chain === 'solana' || chain === 'eclipse') options.solOwners = owners
      if (chain === 'ton') options.onlyWhitelistedTokens = true
      if (chain === 'aptos' && Array.isArray(fungibleAssets)) options.fungibleAssets = fungibleAssets

      if (chain === 'solana') {
        const balances = await sumTokensExport(options)()

        if (Array.isArray(owners) && owners.length) {
          const uniqOwners = [...new Set(owners)]
          const BATCH = 50
          let totalStaked = 0
          for (let i = 0; i < uniqOwners.length; i += BATCH) {
            const chunk = uniqOwners.slice(i, i + BATCH)
            const parts = await Promise.all(chunk.map(addr => getStakedSol(addr)))
            totalStaked += parts.reduce((a, b) => a + b, 0)
          }
          sdk.util.sumSingleBalance(balances, `solana:${ADDRESSES.solana.SOL}`, totalStaked)
        }

        return balances
      }

      return sumTokensExport(options)()
    }
  }
})

module.exports = exportObj