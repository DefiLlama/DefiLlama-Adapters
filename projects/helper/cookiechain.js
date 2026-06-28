const { PublicKey } = require('@solana/web3.js')
const { getConnection } = require('./solana')

// On Cookie Chain only COOK (the wrapped native gas token) has an external price feed
// (mapped to coingecko `cookie-2`). Every other token that lives on the chain has no
// price source, so DefiLlama silently drops it from TVL - leaving pools showing only
// their COOK side. This helper derives a price for those tokens from the on-chain DEX
// pools and re-expresses each one as its COOK-equivalent, so both sides of every pool
// get counted. Conceptually this is the SVM analog of helper/cache/sumUnknownTokens
// (price unknown tokens against a core asset from their LP pools); we hand-roll it here
// because that helper only supports EVM (multiCall / getReserves).
const COOK = 'So11111111111111111111111111111111111111112'
const Q64 = 2 ** 64
// An indirect (non-COOK) hop is only trusted if it is backed by at least this much
// already-trusted COOK liquidity (raw, 9 decimals => 1 COOK). Keeps thin/degenerate
// pools from injecting garbage prices through multi-hop propagation.
const MIN_INDIRECT_COOK_RAW = 1e9
// A derived pool side is counted for at most this multiple of its real counter-side
// liquidity, so a thin or manipulated pool cannot inflate TVL (cf. restrictTokenRatio
// in helper/cache/sumUnknownTokens). The real COOK side is never capped.
const RESTRICT_TOKEN_RATIO = 100

// Pool account layouts, validated byte-for-byte against live accounts on rpc.cookiescan.io.
// `sqrtPrice` is Meteora/Orca/Raydium style: (sqrtPrice / 2^64)^2 == tokenB_raw per tokenA_raw,
// where tokenA is the vaultA side and tokenB the vaultB side. `null` => constant-product pool,
// price is taken from the raw reserve ratio instead.
// `kind`: 'amm' pools are real two-sided LPs => both sides are TVL. 'curve' pools are bonding
// curves whose base (vaultA) side is just unsold mint supply, NOT deposited value => only the
// quote (vaultB) side counts as TVL.
const POOL_SOURCES = [
  // CookieBox DAMM (Meteora Dynamic AMM v2 / cp_amm fork)
  { protocol: 'cookiebox', kind: 'amm', program: 'DAMMjDCEFTDkt7ywazZS8GoaLtjb3HaJo3pLbf64xrPY', dataSize: 1112, vaultA: 232, vaultB: 264, sqrtPrice: 456 },
  // CookieBox CLMM (Orca Whirlpool fork)
  { protocol: 'cookiebox', kind: 'amm', program: 'CLMMmWqTtyNSomqXP3kETJy2SGKPdr31USsm4GfbLyKs', dataSize: 653, disc: '3f95d10ce1806309', vaultA: 133, vaultB: 213, sqrtPrice: 65 },
  // CookieBox DBC (Meteora Dynamic Bonding Curve fork); vaultA = base (unsold supply), vaultB = quote
  { protocol: 'cookiebox', kind: 'curve', program: 'DBCg4ugDEztk6MbqHEJvx5a5YGJTj45Jb5NvtQ48Rvsf', dataSize: 424, disc: 'd5e005d16245775c', vaultA: 168, vaultB: 200, sqrtPrice: 280 },
  // CookieSwap BAMM (Raydium CLMM fork)
  { protocol: 'cookieswap', kind: 'amm', program: 'WTzkPUoprVx7PDc1tfKA5sS7k1ynCgU89WtwZhksHX5', dataSize: 1544, disc: 'f7ede3f5d7c3de46', vaultA: 137, vaultB: 169, sqrtPrice: 253 },
  // CookieSwap CPAMM (SPL Token-Swap fork) - constant product
  { protocol: 'cookieswap', kind: 'amm', program: 'xYBN2zddsqSy41tg1yD9nJScCmqquZnHUyzXBfLEqC8', dataSize: 324, initFlag: true, vaultA: 35, vaultB: 67, sqrtPrice: null },
]

function readU128LE(buf, offset) {
  let x = 0n
  for (let i = 15; i >= 0; i--) x = (x << 8n) | BigInt(buf[offset + i])
  return x
}

function sqrtToPrice(sqrtPrice) {
  const f = Number(sqrtPrice) / Q64 // tokenB_raw per tokenA_raw == sqrt(price) before squaring
  return f * f
}

function decodeTokenAccount(buf) {
  // SPL token (and Token-2022) base layout: mint @0, owner @32, amount (u64 LE) @64
  if (!buf || buf.length < 72) return null
  return {
    mint: new PublicKey(buf.slice(0, 32)).toBase58(),
    raw: Number(buf.readBigUInt64LE(64)),
    rawStr: buf.readBigUInt64LE(64).toString(),
  }
}

async function getMultipleAccountInfo(connection, keys) {
  const out = {}
  for (let i = 0; i < keys.length; i += 100) {
    const chunk = keys.slice(i, i + 100).map((k) => new PublicKey(k))
    // Only mint (@0) and amount (@64) are read, so 72 bytes per token account suffice.
    const infos = await connection.getMultipleAccountsInfo(chunk, { dataSlice: { offset: 0, length: 72 } })
    infos.forEach((info, j) => {
      if (info) out[keys[i + j]] = info.data
    })
  }
  return out
}

// Scans every CookieBox / CookieSwap pool once, caches on the api object, and returns
// { pools, cookRawPer } where cookRawPer[mint] is how many COOK base-units equal one
// base-unit of `mint`. Pricing happens in two phases:
//   A) DIRECT COOK pairs - each token priced from the pool holding the most COOK; these
//      prices are authoritative and never overridden.
//   B) INDIRECT tokens (no direct COOK pool) - priced by hopping through an already-priced
//      neighbour, but only along the path backed by the deepest trusted COOK liquidity and
//      only when each hop clears MIN_INDIRECT_COOK_RAW. Unbounded transitive pricing is
//      avoided on purpose: it both corrupts good direct prices and blows up through thin
//      pools (verified against live chain data).
async function getCookieChainData(api) {
  if (api._cookieChainData) return api._cookieChainData

  const connection = getConnection(api.chain)
  const pools = []
  for (const src of POOL_SOURCES) {
    // Only the discriminator, vault pubkeys and sqrt price are needed, so slice from the
    // account start (offsets stay valid) instead of downloading the whole pool account.
    const sliceLen = Math.max(src.vaultA + 32, src.vaultB + 32, src.sqrtPrice != null ? src.sqrtPrice + 16 : 0)
    const accounts = await connection.getProgramAccounts(new PublicKey(src.program), {
      filters: src.dataSize ? [{ dataSize: src.dataSize }] : [],
      dataSlice: { offset: 0, length: sliceLen },
    })
    for (const { account } of accounts) {
      const data = account.data
      if (src.disc && data.subarray(0, 8).toString('hex') !== src.disc) continue
      if (src.initFlag && !(data[0] === 1 && data[1] === 1)) continue
      pools.push({
        protocol: src.protocol,
        kind: src.kind,
        vaultA: new PublicKey(data.slice(src.vaultA, src.vaultA + 32)).toBase58(),
        vaultB: new PublicKey(data.slice(src.vaultB, src.vaultB + 32)).toBase58(),
        sqrtPrice: src.sqrtPrice == null ? null : readU128LE(data, src.sqrtPrice),
      })
    }
  }

  const vaultKeys = [...new Set(pools.flatMap((p) => [p.vaultA, p.vaultB]))]
  const vaultData = await getMultipleAccountInfo(connection, vaultKeys)
  for (const p of pools) {
    const a = decodeTokenAccount(vaultData[p.vaultA])
    const b = decodeTokenAccount(vaultData[p.vaultB])
    if (a) { p.mintA = a.mint; p.balA = a.raw; p.balAStr = a.rawStr }
    if (b) { p.mintB = b.mint; p.balB = b.raw; p.balBStr = b.rawStr }
  }
  const validPools = pools.filter((p) => p.mintA && p.mintB)

  // Each pool's marginal price as tokenB_raw per tokenA_raw (sqrt price for CL pools,
  // reserve ratio for constant-product pools).
  for (const p of validPools) {
    p.ratioBperA = p.sqrtPrice != null
      ? sqrtToPrice(p.sqrtPrice)
      : (p.balA > 0 ? p.balB / p.balA : null)
  }
  const usablePools = validPools.filter((p) => p.ratioBperA > 0 && isFinite(p.ratioBperA))

  const cookRawPer = { [COOK]: 1 }
  const support = { [COOK]: Infinity } // trusted COOK-equiv liquidity backing each price
  const direct = new Set([COOK])

  // Phase A - authoritative prices from direct COOK pools (deepest COOK reserve wins).
  const bestCookReserve = {}
  for (const p of usablePools) {
    let token, factor, cookReserve
    if (p.mintA === COOK && p.mintB !== COOK) { token = p.mintB; factor = 1 / p.ratioBperA; cookReserve = p.balA }
    else if (p.mintB === COOK && p.mintA !== COOK) { token = p.mintA; factor = p.ratioBperA; cookReserve = p.balB }
    else continue
    if (cookReserve > (bestCookReserve[token] || 0)) {
      bestCookReserve[token] = cookReserve
      cookRawPer[token] = factor
      support[token] = cookReserve
      direct.add(token)
    }
  }

  // Phase B - extend to tokens with no direct COOK pool, hopping through a priced neighbour.
  // Only still-unpriced tokens are touched; the deepest-backed path wins; each hop must
  // clear MIN_INDIRECT_COOK_RAW.
  for (let round = 0, changed = true; changed && round < 8; round++) {
    changed = false
    for (const p of usablePools) {
      if (cookRawPer[p.mintA] != null && !direct.has(p.mintB)) {
        const backing = Math.min(support[p.mintA], p.balA * cookRawPer[p.mintA])
        if (backing >= MIN_INDIRECT_COOK_RAW && backing > (support[p.mintB] || 0)) {
          support[p.mintB] = backing; cookRawPer[p.mintB] = cookRawPer[p.mintA] / p.ratioBperA; changed = true
        }
      }
      if (cookRawPer[p.mintB] != null && !direct.has(p.mintA)) {
        const backing = Math.min(support[p.mintB], p.balB * cookRawPer[p.mintB])
        if (backing >= MIN_INDIRECT_COOK_RAW && backing > (support[p.mintA] || 0)) {
          support[p.mintA] = backing; cookRawPer[p.mintA] = p.ratioBperA * cookRawPer[p.mintB]; changed = true
        }
      }
    }
  }

  api._cookieChainData = { pools: validPools, cookRawPer, support }
  return api._cookieChainData
}

// One-call TVL for a pool-based Cookie Chain protocol ('cookiebox' or 'cookieswap').
// AMM pools contribute both sides; bonding-curve pools contribute only their quote side
// (the base side is unsold mint supply, not deposited value). COOK is summed exactly;
// every other token is valued through the derived price map and its TOTAL contribution is
// capped at RESTRICT_TOKEN_RATIO x the COOK liquidity backing its price, so a thin or
// manipulated pool cannot inflate TVL.
async function addCookiePoolTvl(api, protocol) {
  const { pools, cookRawPer, support } = await getCookieChainData(api)
  let cookRaw = 0n
  const valueByMint = {} // non-COOK mint -> COOK-equivalent value (raw)

  for (const p of pools) {
    if (p.protocol !== protocol) continue
    const sides = p.kind === 'curve'
      ? [[p.mintB, p.balB, p.balBStr]]                       // quote only
      : [[p.mintA, p.balA, p.balAStr], [p.mintB, p.balB, p.balBStr]]
    for (const [mint, raw, rawStr] of sides) {
      if (!raw) continue
      if (mint === COOK) { cookRaw += BigInt(rawStr); continue }
      const factor = cookRawPer[mint]
      if (factor == null) continue                            // no price path -> skipped
      valueByMint[mint] = (valueByMint[mint] || 0) + raw * factor
    }
  }

  if (cookRaw > 0n) api.add(COOK, cookRaw.toString())
  for (const [mint, value] of Object.entries(valueByMint)) {
    const capped = Math.min(value, RESTRICT_TOKEN_RATIO * (support[mint] || 0))
    if (capped > 0) api.add(COOK, Math.round(capped))
  }
}

module.exports = {
  COOK_MINT: COOK,
  getCookieChainData,
  addCookiePoolTvl,
}
