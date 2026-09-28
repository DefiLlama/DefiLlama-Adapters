const axios = require('axios')
const sdk = require('@defillama/sdk')
const { getApplicationAddress } = require('./helper/chain/algorandUtils/address')
const { getAccountInfo, getAssetInfo } = require('./helper/chain/algorand')
const { toUSDTBalances } = require('./helper/balances')

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
async function getPools() {
  const { data } = await algod.get(`/v2/applications/${POOL_PROVIDER_APP_ID}/boxes`, { params: { max: 10000 } })
  const pools = []
  for (const box of data.boxes ?? []) {
    const name = Buffer.from(box.name, 'base64')
    if (name.length !== 59) continue
    if (name.toString('ascii', 0, 2) !== 'fc') continue
    pools.push({
      appId: Number(name.readBigUInt64BE(2)),
      assetA: name.readBigUInt64BE(10),
      assetB: name.readBigUInt64BE(18),
    })
  }
  return pools
}

// The pool provider also keeps a per-pair trade-weighted VWAP box (prefix "s"), independent of
// any specific pool, keyed by the two assets sorted ascending. That's the on-chain price source.
function aggregatedPriceBoxName(idLow, idHigh) {
  const name = Buffer.alloc(17)
  name.write('s', 0, 'ascii')
  name.writeBigUInt64BE(idLow, 1)
  name.writeBigUInt64BE(idHigh, 9)
  return name
}

const priceBoxCache = new Map()
async function getAggregatedInfo(idLow, idHigh) {
  const cacheKey = `${idLow},${idHigh}`
  if (priceBoxCache.has(cacheKey)) return priceBoxCache.get(cacheKey)

  let result
  try {
    const boxName = aggregatedPriceBoxName(idLow, idHigh)
    const { data } = await algod.get(`/v2/applications/${POOL_PROVIDER_APP_ID}/box`, {
      params: { name: `b64:${boxName.toString('base64')}` },
    })
    const value = Buffer.from(data.value, 'base64')
    if (value.length !== 448) throw new Error(`unexpected AppPoolInfo box size: ${value.length}`)
    // AppPoolInfo is a flat tuple of 56 uint64 words (contracts/artifacts/BiatecPoolProvider.arc56.json).
    // Only the fields needed for a trailing 1-day VWAP are decoded here.
    const word = (i) => value.readBigUInt64BE(i * 8)
    result = {
      latestPrice: word(3),
      period2Duration: word(17),
      period2NowVolumeB: word(19),
      period2NowVWAP: word(22),
      period2NowTime: word(23),
      period2PrevVolumeB: word(25),
      period2PrevVWAP: word(28),
    }
  } catch (e) {
    result = undefined // no box -> this pair has never been traded, no price route through it
  }
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

// Price of 1 unit of `target` expressed in 1 unit of `assetX`. VWAP is always stored as
// (higher asset id) per (lower asset id); invert when the asset being priced is the higher id.
async function targetPerUnit(assetX, target) {
  const lo = assetX < target ? assetX : target
  const hi = assetX < target ? target : assetX
  const info = await getAggregatedInfo(lo, hi)
  if (!info) return undefined

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000))
  const vwap = trailing1DayVwap(info, nowSeconds)
  if (vwap === 0n) return undefined
  const hiPerLo = Number(vwap) / Number(PRICE_SCALE)
  return assetX === lo ? hiPerLo : 1 / hiPerLo
}

// Tries a direct USD pair first, then routes through ALGO or VoteCoin. Both amounts entering a
// pool are already normalized to the same 9-decimal base scale inside the contract before the
// price is computed, so the on-chain VWAP is a true human-unit price ratio - no extra decimals
// adjustment is needed on the price itself (only on the raw balance being multiplied by it).
async function getUsdPrice(assetId, usdAssetId = USD_ASSET_ID, bridgeAssetIds = BRIDGE_ASSET_IDS) {
  if (assetId === usdAssetId) return 1

  const direct = await targetPerUnit(assetId, usdAssetId)
  if (direct !== undefined) return direct

  for (const bridge of bridgeAssetIds) {
    if (bridge === assetId) continue
    const assetInBridge = await targetPerUnit(assetId, bridge)
    if (assetInBridge === undefined) continue
    const bridgeInUsd = await getUsdPrice(bridge, usdAssetId, bridgeAssetIds)
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
    const priceUsd = await getUsdPrice(assetId)
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
