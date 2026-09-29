// documentation: https://developer.algorand.org/docs/get-details/indexer/?from_query=curl#sdk-client-instantiations
//
// Indexer transport (rate limited, uint64 safe json parsing) and the address codec live in @defillama/sdk
// (`sdk.chains.algorand`); this file keeps the TVL helpers (sumTokens, tinyman / algofi LP resolution, token ids).

const coreAssets = require('../coreAssets.json')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const algorand = sdk.chains.algorand
const { getApplicationAddress } = algorand
const stateCache = {}
const assetCache = {}

const geckoMapping = Object.values(coreAssets.algorand)

// indexer responses keep the historical `{ application }` / `{ account }` wrapper shapes
async function lookupApplications(appId) {
  const application = await algorand.lookupApplication({ appId })
  return { application }
}

async function lookupAccountByID(accountId) {
  const account = await algorand.lookupAccount({ address: accountId })
  if (!account) throw new Error(`algorand: account not found ${accountId}`)
  return { account }
}

async function searchAccounts({ appId, limit = 1000, nexttoken, searchParams, }) {
  return algorand.searchAccounts({ appId, limit, nextToken: nexttoken, params: searchParams })
}

async function lookupApplicationsCreatedByAccount(accountId) {
  return algorand.lookupApplicationsCreatedByAccount({ address: accountId })
}

async function searchAccountsAll({ appId, limit = 1000, searchParams = {}, sumTokens = false, api }) {
  const accounts = await algorand.searchAccountsAll({ appId, limit, params: searchParams })
  if (sumTokens && api) {
    sdk.log('sumTokens', accounts.length)
    for (const account of accounts) {
      api.add('1', account.amount)
      for (const asset of (account.assets ?? [])) {
        api.add(asset['asset-id']+'', asset.amount)
      }
    }
  }
  return accounts
}

async function sumTokens({ owner, owners = [], tokens = [], token, balances, api, blacklistedTokens = [], tinymanLps = [], blacklistOnLpAsWell = false, tokensAndOwners = [], }) {
  if (!balances) {
    balances = api ? api.getBalances() : {}
  }
  if (owner) owners = [owner]
  if (token) tokens = [token]
  if (tokensAndOwners.length) owners = tokensAndOwners.map(i => i[1])
  const accounts = await Promise.all(owners.map(getAccountInfo))
  accounts.forEach(({ assets }, i) => {
    if (tokensAndOwners.length) tokens = [tokensAndOwners[i][0]]
    assets.forEach(i => {
      if (!tokens.length || tokens.includes(i['asset-id']))
        if (!blacklistedTokens.length || !blacklistedTokens.includes(i['asset-id']))
          sdk.util.sumSingleBalance(balances, i['asset-id'], BigNumber(i.amount).toFixed(0), 'algorand')
    })
  })
  if (tinymanLps.length) {
    await Promise.all(tinymanLps.map(([lp, unknown]) => resolveTinymanLp({ balances, lpId: lp, unknownAsset: unknown, blacklistedTokens: blacklistOnLpAsWell ? blacklistedTokens : [] })))
  }
  return balances
}

async function getAssetInfo(assetId) {
  if (!assetCache[assetId]) assetCache[assetId] = _getAssetInfo()
  return assetCache[assetId]

  async function _getAssetInfo() {
    const asset = await algorand.getAssetInfo({ assetId })
    const reserveInfo = await getAccountInfo(asset.reserve)
    const assetObj = { ...asset, reserveInfo, }
    assetObj.circulatingSupply = assetObj.total - reserveInfo.assetMapping[assetId].amount
    assetObj.assets = { ...reserveInfo.assetMapping }
    delete assetObj.assets[assetId]
    return assetObj
  }
}

async function getAssetInfoWithoutReserve(assetId) {
  if (!assetCache[assetId]) assetCache[assetId] = algorand.getAssetInfo({ assetId })
  return assetCache[assetId]
}

async function resolveTinymanLp({ balances, lpId, unknownAsset, blacklistedTokens, }) {
  const lpBalance = balances['algorand:' + lpId]
  if (lpBalance && lpBalance !== '0') {
    const lpInfo = await getAssetInfo(lpId)
    let ratio = lpBalance / lpInfo.circulatingSupply
    if (unknownAsset && lpInfo.assets[unknownAsset]) {
      ratio = ratio * 2
      Object.keys(lpInfo.assets).forEach((token) => {
        if (!blacklistedTokens.length || !blacklistedTokens.includes(token))
          if (token !== unknownAsset)
            sdk.util.sumSingleBalance(balances, token, BigNumber(lpInfo.assets[token].amount * ratio).toFixed(0), 'algorand')
      })
    } else {
      Object.keys(lpInfo.assets).forEach((token) => {
        if (!blacklistedTokens.length || !blacklistedTokens.includes(token))
          sdk.util.sumSingleBalance(balances, token, BigNumber(lpInfo.assets[token].amount * ratio).toFixed(0), 'algorand')
      })
    }
  }
  delete balances[lpId]
  delete balances['algorand:' + lpId]
  return balances
}

// account with `assets` (asset ids as strings, ALGO under the pseudo id '1') and `assetMapping`; numeric ids are application ids
async function getAccountInfo(accountId) {
  return algorand.getAccountInfo({ address: accountId })
}

const tokens = {
  usdc: 31566704,
  usdt: 312769,
  wBtc: 1058926737,
  wEth: 887406851,
  wBtcGoBtcLp: 1058934626,
  wEthGoEthLp: 1058935051,
  xUsdGoUsdLp: 1081974597,
  usdtGoUsdLp: 1081978679,
  wusdcGoUsdLp: 1242543501,
  wusdtGoUsdLp: 1242550568,
  goUsd: 672913181,
  usdcGoUsdLp: 885102318,
  gard: 684649988,
  gold$: 246516580,
  silver$: 246519683,
  ASAGold: 1241944285
};

// store all asset ids as string
Object.keys(tokens).forEach(t => tokens[t] = '' + tokens[t])

// global state keyed by the latin1 decoded key; uints as numbers, bytes latin1 decoded (historical shape)
async function getAppGlobalState(marketId) {
  if (!stateCache[marketId]) stateCache[marketId] = _getAppGlobalState()
  return stateCache[marketId]

  async function _getAppGlobalState() {
    let response = await lookupApplications(marketId);
    let results = {}
    response.application.params["global-state"].forEach(x => {
      let decodedKey = Buffer.from(x.key, "base64").toString("binary")
      results[decodedKey] = typeof x.value.uint === 'string' ? Number(x.value.uint) : x.value.uint
      if (x.value.type === 1) results[decodedKey] = Buffer.from(x.value.bytes, "base64").toString("binary")
    })

    return results
  }
}

async function getPriceFromAlgoFiLP(lpAssetId, unknownAssetId) {
  let lpInfo = await getAssetInfo(lpAssetId)
  if (lpInfo['unit-name'] !== 'AF-POOL') throw new Error('No, this is not an AlgoFi LP')

  const unknownAssetQuantity = lpInfo.reserveInfo.assets.find(i => i['asset-id'] === '' + unknownAssetId).amount
  for (const i of lpInfo.reserveInfo.assets) {
    const id = i['asset-id']
    if (geckoMapping.includes(id)) {
      return {
        price: i.amount / unknownAssetQuantity,
        geckoId: 'algorand:' + id,
        decimals: 0,
      }
    }
  }

  throw new Error('Not mapped with any whitelisted assets')
}

// Biatec CLAMM (an Algorand DEX) pool provider, mainnet. Every pool registers a per-pair
// trade-weighted VWAP box here (prefix "s"), independent of any specific pool - a time-weighted
// average, harder to skew with one imbalanced pool than AlgoFi's instantaneous LP reserve ratio
// above. Docs: https://github.com/scholtz/BiatecCLAMM/blob/main/docusaurus/docs/onchain-tvl-discovery.md
const BIATEC_POOL_PROVIDER_APP_ID = 3074197785
const BIATEC_PRICE_SCALE = 1_000_000_000n // contracts/BiatecPoolProvider.algo.ts SCALE
// Bridge assets tried, in order, when a token has no pair directly against an already-trusted
// (coreAssets) asset: ALGO, then Biatec's own VoteCoin (mainnet asset id).
const BIATEC_BRIDGE_ASSET_IDS = [0n, 452399768n]

function biatecAggregatedPriceBoxName(boxAssetA, boxAssetB) {
  const name = Buffer.alloc(17)
  name.write('s', 0, 'ascii')
  name.writeBigUInt64BE(boxAssetA, 1)
  name.writeBigUInt64BE(boxAssetB, 9)
  return name
}

// The box is keyed by whichever assetA/assetB order the first pool for that pair registered
// with - newer pools assert assetA < assetB at creation, but only when neither side is ALGO, so
// some live mainnet pools predate that assert and the box can be found under either order.
// Always trust the box's own decoded assetA/assetB fields for direction, never the query order.
async function fetchBiatecAggregatedBox(boxAssetA, boxAssetB) {
  try {
    const name = biatecAggregatedPriceBoxName(boxAssetA, boxAssetB)
    const res = await algorand.getApplicationBox({ appId: BIATEC_POOL_PROVIDER_APP_ID, name })
    const value = Buffer.from(res.value, 'base64')
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
    // sdk.chains.algorand's http layer doesn't expose a structured status code on the error it
    // throws (it's flattened into the message, e.g. "... [404] ..."), so that's the only signal
    // available to distinguish "no box here" from a real failure.
    if (String(e?.message ?? e).includes('[404]')) return undefined // no box at this key - genuinely never traded
    throw e // a real failure (indexer error, unexpected box shape) must not look like "no route"
  }
}

async function getBiatecAggregatedInfo(idLow, idHigh) {
  return (await fetchBiatecAggregatedBox(idLow, idHigh)) ?? (await fetchBiatecAggregatedBox(idHigh, idLow))
}

// Blends the still-accumulating "Now" bucket with the tail of the closed "Prev" bucket so the
// result always covers a full trailing 24h window, regardless of where "now" falls inside the
// epoch-aligned Now bucket. Falls back to the pair's last trade price when neither bucket has
// had any volume in the last ~2 days (the pair is real but currently inactive).
function biatecTrailing1DayVwap(info, nowSeconds) {
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

// Price of 1 unit of `target` expressed in 1 unit of `assetX` (both real chain asset ids, ALGO
// = 0n). VWAP is stored as (box's own assetB) per (box's own assetA) - direction comes from the
// box's own decoded fields, never from the ascending order used just to build the lookup key.
async function biatecTargetPerUnit(assetX, target) {
  const lo = assetX < target ? assetX : target
  const hi = assetX < target ? target : assetX
  const info = await getBiatecAggregatedInfo(lo, hi)
  if (!info) return undefined

  const nowSeconds = BigInt(Math.floor(Date.now() / 1000))
  const vwap = biatecTrailing1DayVwap(info, nowSeconds)
  if (vwap === 0n) return undefined
  const assetBPerAssetA = Number(vwap) / Number(BIATEC_PRICE_SCALE)
  if (assetX === info.assetA) return assetBPerAssetA
  if (assetX === info.assetB) return 1 / assetBPerAssetA
  return undefined // box contents don't match the pair queried - shouldn't happen, safety net
}

const toGeckoAssetKey = (realAssetId) => (realAssetId === 0n ? '1' : realAssetId.toString())

// Human-unit price of 1 unit of `assetId` denominated in 1 unit of the first already-trusted
// (coreAssets) asset reachable via the bridge chain. `visited` prevents a routing cycle: if two
// bridge assets are only priced against each other and neither has its own trusted route,
// resolving either one would otherwise recurse forever.
async function getBiatecPriceViaTrustedBridge(assetId, visited = new Set()) {
  if (geckoMapping.includes(toGeckoAssetKey(assetId))) return { humanPrice: 1, trustedAssetId: assetId }
  if (visited.has(assetId)) return undefined
  visited.add(assetId)

  for (const bridge of BIATEC_BRIDGE_ASSET_IDS) {
    if (bridge === assetId || visited.has(bridge)) continue
    const assetInBridge = await biatecTargetPerUnit(assetId, bridge) // bridge-units per 1 assetId
    if (assetInBridge === undefined) continue
    const bridgeResolved = await getBiatecPriceViaTrustedBridge(bridge, visited)
    if (!bridgeResolved) continue
    return { humanPrice: assetInBridge * bridgeResolved.humanPrice, trustedAssetId: bridgeResolved.trustedAssetId }
  }
  return undefined // no route to any trusted asset yet - this token/pair has never traded
}

async function getBiatecAssetDecimals(assetId) {
  if (assetId === 0n) return 6 // ALGO
  const info = await getAssetInfoWithoutReserve(assetId.toString())
  return info.decimals
}

/**
 * Prices an Algorand asset traded on Biatec's CLAMM pools by bridging to whichever asset
 * DefiLlama already recognizes (any id listed in coreAssets.algorand, not hardcoded to just
 * ALGO/USDC), using Biatec's own on-chain trailing 1-day VWAP. Same {price, geckoId, decimals}
 * shape as getPriceFromAlgoFiLP above: get the equivalent balance of the trusted asset via
 * `rawAmount * price / 10 ** decimals`, then sum it into that asset's own (already priced)
 * balance - this never asserts a USD figure itself, only a token-for-token exchange rate that
 * DefiLlama's normal pricing of the trusted asset then converts to USD.
 * `assetId` is the real chain asset id as a bigint (use 0n for ALGO). Returns undefined if no
 * route to a trusted asset exists yet (the token has never traded against one, even indirectly).
 */
async function getPriceFromBiatecClamm(assetId) {
  const resolved = await getBiatecPriceViaTrustedBridge(assetId)
  if (!resolved) return undefined

  const [assetDecimals, trustedDecimals] = await Promise.all([
    getBiatecAssetDecimals(assetId),
    getBiatecAssetDecimals(resolved.trustedAssetId),
  ])
  // raw * price / 10**decimals must equal the equivalent raw amount of the trusted asset:
  // price = humanPrice(trusted per assetId) * 10**trustedDecimals, decimals = assetId's own.
  return {
    price: resolved.humanPrice * 10 ** trustedDecimals,
    decimals: assetDecimals,
    geckoId: 'algorand:' + toGeckoAssetKey(resolved.trustedAssetId),
  }
}

async function lookupTransactionsByID(searchParams = {}) {
  return algorand.lookupTransactions({ params: searchParams })
}

async function getApplicationBoxes({ appId, limit = 1000, nexttoken, }) {
  const res = await algorand.getApplicationBoxes({ appId, limit, nextToken: nexttoken })
  return res.boxes
}

module.exports = {
  tokens,
  getAssetInfo,
  getAssetInfoWithoutReserve,
  searchAccountsAll,
  getAccountInfo,
  sumTokens,
  getApplicationAddress,
  lookupApplications,
  lookupAccountByID,
  lookupTransactionsByID,
  searchAccounts,
  getAppGlobalState,
  getPriceFromAlgoFiLP,
  getPriceFromBiatecClamm,
  lookupApplicationsCreatedByAccount,
  getApplicationBoxes,
}
