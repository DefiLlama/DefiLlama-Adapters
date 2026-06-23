const { get } = require('../helper/http')

// LiquidBots — automated grid-trading bots on Hyperliquid perps.
// TVL = total account value across all LqTrader accounts on Hyperliquid, read
// on-chain via Hyperliquid EVM precompiles (AccountMarginSummary) batched through
// Multicall3, and served as a single USD figure by the public stats endpoint.
const STATS_URL = 'https://api.liquidbots.xyz/api/v1/stats/platform'

async function tvl(api) {
  const data = await get(STATS_URL)
  return api.addUSDValue(Number(data?.tvl?.tvl || 0))
}

module.exports = {
  misrepresentedTokens: true, // TVL is reported as a USD value, not per-token balances
  timetravel: false,          // endpoint serves current TVL only (no historical snapshots)
  methodology:
    'TVL is the total account value across all LqTrader accounts on Hyperliquid. ' +
    'Each account\'s margin summary is read on-chain via Hyperliquid EVM precompiles ' +
    '(AccountMarginSummary) batched through Multicall3, then summed. Served via the ' +
    'public /api/v1/stats/platform endpoint.',
  hyperliquid: { tvl },
}
