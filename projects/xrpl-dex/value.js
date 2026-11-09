// Values a snapshot of XRPL AMM pools. Pure function, no network calls, so it can be unit tested.
//
// Method (same idea as helper/portedTokens.js transformDexBalances, but tokens are keyed by
// currency + issuer, never by currency code alone, so a token copying another token's code cannot
// borrow its price):
//  - priced ("core") assets: XRP and RLUSD (both priced by the coins server)
//  - pool with two core assets: both sides are counted
//  - pool with one core asset: the core side is counted twice (AMM pools are 50/50 by value)
//  - pool with no core asset: each side is converted to a core asset at the price implied by the
//    deepest pool pairing that token with a core asset, capped at RESTRICT_TOKEN_RATIO times the
//    token amount sitting in core pools (same cap as transformDexBalances); the rest is dropped
//
// Input pool shape (amm_info result fields): { account, amount, amount2 }
//   amount / amount2: XRP as a drops string, issued tokens as { currency, issuer, value },
//   MPTs as { mpt_issuance_id, value } (keyed MPT.<id>; no MPT is in CORE_TOKENS today, so they count through the other side).
// Output: { xrp: <XRP amount>, tokens: { 'CURRENCY.rISSUER': <token amount> }, stats }

const RESTRICT_TOKEN_RATIO = 5

const RLUSD = '524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De' // RLUSD (Ripple)

const CORE_TOKENS = new Set(['XRP', RLUSD])

function parseSide(side) {
  if (typeof side === 'string') return { key: 'XRP', amount: Number(side) / 1e6 }
  if (side && side.mpt_issuance_id) return { key: `MPT.${side.mpt_issuance_id}`, amount: Number(side.value) }
  return { key: `${side.currency}.${side.issuer}`, amount: Number(side.value) }
}

function valuePools(pools) {
  const totals = {}
  const add = (key, amount) => { totals[key] = (totals[key] || 0) + amount }
  const prices = {} // token -> { core, price, depth, capacity }
  const parsed = []
  let skipped = 0

  for (const pool of pools) {
    if (!pool || pool.amount === undefined || pool.amount2 === undefined) { skipped++; continue }
    const a = parseSide(pool.amount)
    const b = parseSide(pool.amount2)
    if (!(a.amount > 0) || !(b.amount > 0)) { skipped++; continue }
    parsed.push([a, b])
    const aCore = CORE_TOKENS.has(a.key)
    const bCore = CORE_TOKENS.has(b.key)
    if (aCore === bCore) continue
    const [token, core] = aCore ? [b, a] : [a, b]
    const p = prices[token.key]
    if (!p) prices[token.key] = { core: core.key, price: core.amount / token.amount, depth: token.amount, capacity: token.amount * RESTRICT_TOKEN_RATIO }
    else {
      p.capacity += token.amount * RESTRICT_TOKEN_RATIO
      if (token.amount > p.depth) Object.assign(p, { core: core.key, price: core.amount / token.amount, depth: token.amount })
    }
  }

  let tokenTokenPools = 0
  for (const [a, b] of parsed) {
    const aCore = CORE_TOKENS.has(a.key)
    const bCore = CORE_TOKENS.has(b.key)
    if (aCore && bCore) { add(a.key, a.amount); add(b.key, b.amount); continue }
    if (aCore) { add(a.key, 2 * a.amount); continue }
    if (bCore) { add(b.key, 2 * b.amount); continue }
    tokenTokenPools++
    for (const side of [a, b]) {
      const p = prices[side.key]
      if (!p || p.capacity <= 0) continue
      const convertible = Math.min(side.amount, p.capacity)
      p.capacity -= convertible
      add(p.core, convertible * p.price)
    }
  }

  const { XRP: xrp = 0, ...tokens } = totals
  return { xrp, tokens, stats: { pools: pools.length, valued: parsed.length, skipped, tokenTokenPools } }
}

module.exports = { valuePools, CORE_TOKENS, RLUSD }
