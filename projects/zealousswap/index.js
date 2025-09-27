// projects/zealousswap/index.js
const sdk = require('@defillama/sdk')

const CHAIN   = 'kasplex'
const FACTORY = '0x98Bb580A77eE329796a79aBd05c6D2F2b3D5E1bD'
const WKAS    = '0x2c2Ae87Ba178F48637acAe54B87c3924F544a83e'.toLowerCase()

const abi = {
  allPairsLength: 'function allPairsLength() view returns (uint256)',
  allPairs:       'function allPairs(uint256) view returns (address)',
  token0:         'function token0() view returns (address)',
  token1:         'function token1() view returns (address)',
  getReserves:    'function getReserves() view returns (uint112,uint112,uint32)',
  decimals:       'function decimals() view returns (uint8)',
}

const lower = (x) => (x || '').toLowerCase()

async function tvl(_, _b, _cb, { api }) {
  const pairsLen = await api.call({ target: FACTORY, abi: abi.allPairsLength, chain: CHAIN })
  if (!+pairsLen) return {}

  const idx   = Array.from({ length: Number(pairsLen) }, (_, i) => i)
  const pairs = await api.multiCall({
    abi: abi.allPairs, calls: idx.map(i => ({ target: FACTORY, params: [i] })), chain: CHAIN
  })

  const [t0, t1, res] = await Promise.all([
    api.multiCall({ abi: abi.token0, calls: pairs.map(p => ({ target: p })), chain: CHAIN }),
    api.multiCall({ abi: abi.token1, calls: pairs.map(p => ({ target: p })), chain: CHAIN }),
    api.multiCall({ abi: abi.getReserves, calls: pairs.map(p => ({ target: p })), chain: CHAIN }),
  ])

  const tokens = Array.from(new Set([...t0, ...t1].map(lower)))
  const decimalsArr = await api.multiCall({
    abi: abi.decimals,
    calls: tokens.map(a => ({ target: a })),
    chain: CHAIN,
    permitFailure: true,
  })
  const dec = new Map(tokens.map((a, i) => [a, BigInt(decimalsArr[i] ?? 18)]))

  // IMPORTANT: use WKAS real decimals for the unit base
  const dW = dec.get(WKAS) ?? 18n
  const ONE = 10n ** dW

  // build edges with decimals-aware pricing
  const edges = []
  for (let i = 0; i < pairs.length; i++) {
    const a0 = lower(t0[i]), a1 = lower(t1[i])
    const [r0s, r1s] = res[i] || ['0', '0']
    const r0 = BigInt(r0s), r1 = BigInt(r1s)
    if (r0 === 0n || r1 === 0n) continue
    const d0 = dec.get(a0) ?? 18n
    const d1 = dec.get(a1) ?? 18n
    // price(a0) in WKAS base-units: p0 = ( (r1 / 10^d1) / (r0 / 10^d0) ) * ONE
    // => p0 = r1 * 10^(d0) * ONE / (r0 * 10^(d1))
    edges.push({ a0, a1, r0, r1, d0, d1 })
  }

  const price = new Map([[WKAS, ONE]])
  const MIN_ROUTE_WKAS = 500n * ONE // ignore tiny routes

  let improved = true
  for (let round = 0; improved && round < 8; round++) {
    improved = false
    for (const { a0, a1, r0, r1, d0, d1 } of edges) {
      const p0 = price.get(a0)
      const p1 = price.get(a1)

      if (!p0 && p1) {
        const p0e = (r1 * (10n ** d0) * p1) / (r0 * (10n ** d1))
        // route liquidity in WKAS units on the known side
        const route = (r1 * p1) / (10n ** d1)
        if (p0e > 0n && route >= MIN_ROUTE_WKAS) { price.set(a0, p0e); improved = true }
      } else if (!p1 && p0) {
        const p1e = (r0 * (10n ** d1) * p0) / (r1 * (10n ** d0))
        const route = (r0 * p0) / (10n ** d0)
        if (p1e > 0n && route >= MIN_ROUTE_WKAS) { price.set(a1, p1e); improved = true }
      }
    }
  }

  // sum TVL in WKAS base units: sum( reserve_i/10^di * price_i )
  let wkasTotal = 0n
  for (const { a0, a1, r0, r1, d0, d1 } of edges) {
    const p0 = price.get(a0), p1 = price.get(a1)
    if (p0) wkasTotal += (r0 * p0) / (10n ** d0)
    if (p1) wkasTotal += (r1 * p1) / (10n ** d1)
  }

  // convert to whole KAS for llama balance (divide by WKAS decimals)
  const kasWhole = wkasTotal / ONE

  // sanity guard to avoid accidental 1e12x reports
  if (kasWhole > 10_000_000_000n) {
    // if something goes off the rails, fall back to raw balances to avoid bad PRs
    for (let i = 0; i < pairs.length; i++) {
      const a0 = lower(t0[i]), a1 = lower(t1[i])
      const [R0, R1] = res[i] || ['0','0']
      sdk.util.sumSingleBalance(api.getBalances(), `${CHAIN}:${a0}`, R0.toString())
      sdk.util.sumSingleBalance(api.getBalances(), `${CHAIN}:${a1}`, R1.toString())
    }
    return api.getBalances()
  }

  if (kasWhole > 0n)
    sdk.util.sumSingleBalance(api.getBalances(), 'coingecko:kaspa', kasWhole.toString())

  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'Prices tokens in WKAS using actual token decimals; TVL = sum(reserve/10^dec * price) in KAS.',
  kasplex: { tvl },
}
