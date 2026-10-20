const USD_INFRA = 'dawn7ZUF7h7anFuEsDdAU1Y3HYwikwqNMAENZsQJdNL'
const PRICE_URL = `https://markets-109615290061.us-central1.run.app/prices/switchboard/${USD_INFRA}`

// CoinGecko's USD.infra quote stopped updating. Use Loopscale's published
// oracle USD spot for this mint, in both the TVL and borrowed buckets.
// Amounts still come from on-chain accounts; do not assume a $1 peg.
async function addPricedBalances(api, balances) {
  const amount = balances[USD_INFRA] ?? 0n
  if (amount !== 0n) {
    const response = await fetch(PRICE_URL, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`USD.infra oracle returned HTTP ${response.status}`)
    const { mint, usdPrice, timestamp } = await response.json()
    const age = Date.now() / 1000 - timestamp
    if (mint !== USD_INFRA ||
        typeof usdPrice !== 'number' || !Number.isFinite(usdPrice) || usdPrice <= 0 ||
        !Number.isSafeInteger(timestamp) || age > 600 || age < -60) {
      throw new Error('USD.infra oracle returned an invalid or stale price')
    }
    const usdValue = Number(amount) / 1e6 * usdPrice
    if (!Number.isFinite(usdValue)) throw new Error('Invalid USD.infra balance')
    api.addUSDValue(usdValue)
  }

  // Exclude USD.infra even if the coins API starts pricing it again, so it
  // cannot be counted twice.
  const entries = Object.entries(balances).filter(([mint]) => mint !== USD_INFRA)
  api.addTokens(entries.map(([mint]) => mint), entries.map(([, amount]) => amount))
}

module.exports = { addPricedBalances }
