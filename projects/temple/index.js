const { get } = require('../helper/http')

const TVL_URL = 'https://api.cctools.network/api/markets/temple/tvl'
const FETCH_OPTS = { headers: { 'User-Agent': 'DefiLlama-Adapter (temple)' } }

async function tvl(api) {
  const feed = await get(TVL_URL, FETCH_OPTS)
  if (!feed || !Array.isArray(feed.assets) || feed.assets.length === 0)
    throw new Error('temple: CCTools feed returned no assets')

  for (const asset of feed.assets) {
    if (!asset.coingeckoId)
      throw new Error(`temple: no coingecko id for ${asset.symbol}`)

    // Amounts are already decimal-adjusted; do not scale them again.
    const deposited = Number(asset.deposited)
    if (!Number.isFinite(deposited) || deposited < 0)
      throw new Error(`temple: invalid deposited amount for ${asset.symbol}`)
    
    if (feed.amountsAreScaled !== true) throw new Error('temple: CCTools feed amounts are not scaled')

    api.addCGToken(asset.coingeckoId, deposited)
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Temple is building private and compliant financial market infrastructure for the world's institutions on the Canton Network. " +
    "Users lock assets in Canton Token Standard allocation contracts to trade through Temple's price-time-priority central limit order book, with matched trades settling atomically on-chain. " +
    "TVL is the gross value of CC, USDCx, CBTC, and USDA deposited in those contracts: unlocked plus locked balances, excluding balances in flight during settlement. " +
    "Temple has no borrow side, so nothing is netted from TVL. Balances are read from the CCTools API, a third-party Canton data aggregator that normalizes per-asset balances with canonical Canton instrument and CoinGecko IDs.",
  canton: { tvl },
}
