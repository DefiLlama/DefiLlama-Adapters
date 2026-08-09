const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

// Public list of active Earn vault pubkeys (Squads smart accounts)
// Production: https://stats.askloyal.com/api/earn/vaults
// For local / PR testing you can temporarily point this at your Vercel preview URL
const VAULTS_API = 'https://stats.askloyal.com/api/earn/vaults'

const TOKENS = [
  ADDRESSES.solana.USDC,   // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  // add more stables here if Earn supports them later (USDT, PYUSD, etc.)
]

async function tvl(api) {
  const data = await getConfig('loyal/vaults', VAULTS_API)

  // Support both the object shape { vaults: [...] } and a plain array
  const owners = Array.isArray(data) ? data : (data.vaults || [])

  if (!owners.length) {
    api.log('[Loyal] No active vaults returned from API')
    return {}
  }

  api.log(`[Loyal] Fetching balances for ${owners.length} vaults`)

  return sumTokens2({
    api,
    owners,
    tokens: TOKENS,
    // allowError: true, // uncomment if some ATAs may not exist yet
  })
}

module.exports = {
  timetravel: false, // list of vaults comes from a live API
  methodology:
    'TVL is the sum of token balances held by active Loyal Earn vaults (Squads smart accounts). The list of vault addresses is fetched from the public Loyal stats API; balances are read on-chain.',
  solana: { tvl },
}