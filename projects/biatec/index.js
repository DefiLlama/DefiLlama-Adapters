const axios = require('axios')
const sdk = require('@defillama/sdk')
const { getApplicationAddress } = require('../helper/chain/algorandUtils/address')
const { getAccountInfo, getAssetInfo } = require('../helper/chain/algorand')
const { toUSDTBalances } = require('../helper/balances')

// Biatec CLAMM pool factory/registry app, mainnet. Every pool registers itself here as a box.
// Discovery + pricing process documented by the Biatec team at
// https://github.com/scholtz/BiatecCLAMM/blob/main/docusaurus/docs/onchain-tvl-discovery.md
const POOL_PROVIDER_APP_ID = 3074197785

// Bridge assets used to route a balance to USD when it has no direct USD pair: ALGO, then
// Biatec's own VoteCoin (mainnet asset id, see BiatecCLAMM/.env.example).
const USD_ASSET_ID = 31566704n // USDC
const BRIDGE_ASSET_IDS = [0n, 452399768n]
const PRICE_SCALE = 1_000_000_000n // contracts/BiatecPoolProvider.algo.ts SCALE

const algod = axios.create({
  baseURL: 'https://mainnet-api.algonode.cloud',
  timeout: 300000,
})

// Each pool registers a box named "fc" + poolAppId(8) + assetA(8) + assetB(8) + ... (59 bytes).
// The box name alone carries the pool's asset pair, so no other read is needed to enumerate pools.
//
// algod's box listing is paginated: a page's response includes "next-token" whenever more boxes
// remain, and that value must be echoed back as the "next" param to fetch the following page
// (https://dev.algorand.co/reference/rest-api/algod/operations/getapplicationboxes/). A single
// call with only "max" set silently returns just the first page once the provider has enough
// pools to exceed algod's per-response size limit, so this loops until "next-token" is absent.
async function getBoxNames(appId, prefix) {
  const names = []
  let next
  for (;;) {
    const { data } = await algod.get(`/v2/applications/${appId}/boxes`, {
      params: { prefix: `str:${prefix}`, limit: 1000, next },
    })
    for (const box of data.boxes ?? []) names.push(Buffer.from(box.name, 'base64'))
    const nextToken = data['next-token']
    if (!nextToken) break
    if (nextToken === next) throw new Error(`algod box pagination cursor did not advance: ${nextToken}`)
    next = nextToken
  }
  return names
}

async function getPools() {
  const boxNames = await getBoxNames(POOL_PROVIDER_APP_ID, 'fc')
  const pools = []
  for (const name of boxNames) {
    if (name.length !== 59) continue
    pools.push({
      appId: Number(name.readBigUInt64BE(2)),
      assetA: name.readBigUInt64BE(10),
      assetB: name.readBigUInt64BE(18),
    })
  }
  return pools
}

// The pool provider also keeps a per-pair trade-weighted VWAP box (prefix "s"), independent of
// any specific pool. The box is keyed by whatever assetA/assetB order the FIRST pool for that
// pair registered with. Newer pools assert assetA < assetB at creation
// (contracts/BiatecClammPool.algo.ts, bootstrap()) - but only when NEITHER side is ALGO, and
// some live mainnet pools predate that assert - so the box can be found under either order
// (confirmed live: e.g. VOTE/ALGO is stored as assetA=VOTE, assetB=ALGO=0, not ascending).
// Always trust the box's own decoded assetA/assetB fields for direction, never the query order.
function aggregatedPriceBoxName(boxAssetA, boxAssetB) {
  const name = Buffer.alloc(17)
  name.write('s', 0, 'ascii')
  name.writeBigUInt64BE(boxAssetA, 1)
  name.writeBigUInt64BE(boxAssetB, 9)
  return name
}

async function fetchAggregatedBox(boxAssetA, boxAssetB) {
  try {
    const boxName = aggregatedPriceBoxName(boxAssetA, boxAssetB)
    const { data } = await algod.get(`/v2/applications/${POOL_PROVIDER_APP_ID}/box`, {
      params: { name: `b64:${boxName.toString('base64')}` },
    })
    const value = Buffer.from(data.value, 'base64')
    if (value.length !== 448) throw new Error(`unexpected AppPoolInfo box size: ${value.length}`)
    // AppPoolInfo is a flat tuple of 56 uint64 words (contracts/artifacts/BiatecPoolProvider.arc56.json).
    // Only the fields needed for a trailing 1-day VWAP are decoded here.
    const word = (i) => value.readBigUInt64BE(i * 8)
    return {
      assetA: word(0),
      assetB: word(1),
      latestPrice: word(3),
      period2Duration: word(17),
      period2NowVolumeB: word(19),
      period2NowVWAP: word(22),
      period2NowTime: word(23),
      period2PrevVolumeB: word(25),
      period2PrevVWAP: word(28),
    }
  } catch (e) {
    return undefined // no box at this key
  }
}

// Caller-scoped cache (fresh per tvl() run, see below) so a later run always reads current
// on-chain prices instead of reusing whatever a previous run happened to see.
async function getAggregatedInfo(priceBoxCache, idLow, idHigh) {
  const cacheKey = `${idLow},${idHigh}`
  if (priceBoxCache.has(cacheKey)) return priceBoxCache.get(cacheKey)

  const result = (await fetchAggregatedBox(idLow, idHigh)) ?? (await fetchAggregatedBox(idHigh, idLow))
  priceBoxCache.set(cacheKey, result)
  return result
}

// Blends the still-accumulating "Now" bucket with the tail of the closed "Prev" bucket so the
// result always covers a full trailing 24h window, regardless of where "now" falls inside the
// epoch-aligned Now bucket. Falls back to the pair's last trade price when neither bucket has
// had any volume in the last ~2 days (the pair is real but currently inactive).
function trailing1DayVwap(info, nowSeconds) {
  const duration = info.period2Duration
  const elapsedInNow = nowSeconds - info.period2NowTime
  const remainingFromPrev = duration - elapsedInNow

  let vwap
  if (remainingFromPrev <= 0n || info.period2PrevVolumeB === 0n) {
    vwap = info.period2NowVWAP
  } else {
    const prevWeight = (info.period2PrevVolumeB * remainingFromPrev) / duration
    const nowWeight = info.period2NowVolumeB
    vwap = nowWeight + prevWeight === 0n
      ? info.period2PrevVWAP
      : (info.period2NowVWAP * nowWeight + info.period2PrevVWAP * prevWeight) / (nowWeight + prevWeight)
  }
  return vwap !== 0n ? vwap : info.latestPrice
}

// Price of 1 unit of `target` expressed in 1 unit of `assetX`. VWAP is stored as
// (box's own assetB) per (box's own assetA) - read direction from the box's own decoded fields,
// never assume it matches the ascending (lo, hi) order used just to build the lookup key.
async function targetPerUnit(priceBoxCache, assetX, target) {
  const lo = assetX < target ? assetX : target
  const hi = assetX < target ? target : assetX
  const info = await getAggregatedInfo(priceBoxCache, lo, hi)
  if (!info) return undefined

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000))
  const vwap = trailing1DayVwap(info, nowSeconds)
  if (vwap === 0n) return undefined
  const assetBPerAssetA = Number(vwap) / Number(PRICE_SCALE)
  if (assetX === info.assetA) return assetBPerAssetA
  if (assetX === info.assetB) return 1 / assetBPerAssetA
  return undefined // box contents don't match the pair queried - shouldn't happen, safety net
}

// Tries a direct USD pair first, then routes through ALGO or VoteCoin. Both amounts entering a
// pool are already normalized to the same 9-decimal base scale inside the contract before the
// price is computed, so the on-chain VWAP is a true human-unit price ratio - no extra decimals
// adjustment is needed on the price itself (only on the raw balance being multiplied by it).
//
// `visited` guards against a routing cycle: e.g. if ALGO and VoteCoin are only priced against
// each other and neither has its own direct USD pair yet, pricing ALGO would otherwise recurse
// into pricing VoteCoin, which recurses back into pricing ALGO, forever. Each asset can appear
// at most once per top-level price lookup.
async function getUsdPrice(priceBoxCache, assetId, usdAssetId = USD_ASSET_ID, bridgeAssetIds = BRIDGE_ASSET_IDS, visited = new Set()) {
  if (assetId === usdAssetId) return 1
  if (visited.has(assetId)) return undefined
  visited.add(assetId)

  const direct = await targetPerUnit(priceBoxCache, assetId, usdAssetId)
  if (direct !== undefined) return direct

  for (const bridge of bridgeAssetIds) {
    if (bridge === assetId || visited.has(bridge)) continue
    const assetInBridge = await targetPerUnit(priceBoxCache, assetId, bridge)
    if (assetInBridge === undefined) continue
    const bridgeInUsd = await getUsdPrice(priceBoxCache, bridge, usdAssetId, bridgeAssetIds, visited)
    if (bridgeInUsd === undefined) continue
    return assetInBridge * bridgeInUsd
  }
  return undefined // no USD route found yet (pair has never traded) - excluded from TVL, not zeroed
}

async function getDecimals(assetId) {
  if (assetId === 0n) return 6 // ALGO
  return (await getAssetInfo(assetId.toString())).decimals
}

async function tvl() {
  const priceBoxCache = new Map() // scoped to this run only, see getAggregatedInfo
  const pools = await getPools()

  // Sum only each pool's own two registered assets - NOT every asset the pool account happens
  // to hold. Every pool also custodies its own LP token (often an 18e12+ fixed mint) in its own
  // account; including that would count a claim on the pool as if it were separate real TVL.
  const rawBalances = new Map()
  for (const pool of pools) {
    const address = getApplicationAddress(pool.appId)
    const account = await getAccountInfo(address)
    for (const assetId of [pool.assetA, pool.assetB]) {
      const key = assetId === 0n ? '1' : assetId.toString() // getAccountInfo maps ALGO to '1'
      const holding = account.assetMapping[key]
      if (!holding) continue
      rawBalances.set(assetId, (rawBalances.get(assetId) ?? 0n) + BigInt(holding.amount))
    }
  }

  // Price each real asset with Biatec's own on-chain VWAP. An asset with no resolvable USD
  // route yet (never traded against USD/ALGO/VOTE) is left as a raw balance instead, so
  // DefiLlama's own token pricing (coingecko/coreAssets) gets a chance to price it centrally -
  // this also covers assets already known there (e.g. FOLKS) more accurately than a single
  // DEX's own price would.
  const balances = {}
  let tvlUsd = 0
  for (const [assetId, raw] of rawBalances) {
    const priceUsd = await getUsdPrice(priceBoxCache, assetId)
    if (priceUsd === undefined) {
      sdk.util.sumSingleBalance(balances, assetId === 0n ? '1' : assetId.toString(), raw.toString(), 'algorand')
      continue
    }
    const decimals = await getDecimals(assetId)
    tvlUsd += (Number(raw) / 10 ** decimals) * priceUsd
  }

  return { ...balances, ...toUSDTBalances(tvlUsd) }
}

module.exports = {
  methodology: "Sums each Biatec CLAMM pool's real on-chain asset balances (never its own LP token). Pools are discovered from the pool provider app's box storage, not a hardcoded list. Balances are converted to USD using Biatec's own on-chain trailing 1-day VWAP price (routed through ALGO/VoteCoin when there's no direct USD pair); an asset with no on-chain USD route yet is left for DefiLlama's own token pricing to resolve instead.",
  algorand: {
    tvl,
  },
}
