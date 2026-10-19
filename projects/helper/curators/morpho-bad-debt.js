// Morpho vaults keep booking loans that will not be paid back. Two cases are left out of their TVL:
//
// 1. Markets with unrealised bad debt. When a market's collateral is worthless nobody repays and
//    nobody liquidates, so the market stays fully borrowed and keeps accruing interest into its
//    suppliers' balances. The AdaptiveCurveIrm marks such a market: at ~100% utilisation its rate at
//    target keeps rising until it hits the 200% APR cap. Getting to half the cap from the 4% initial
//    rate takes more than three weeks of full utilisation at 400%+ APR, which a solvent borrower
//    does not pay.
// 2. Losses that MetaMorpho v1.1 keeps in totalAssets(): it adds lostAssets back so that the share
//    price does not drop. Rounding leaves a few wei of lostAssets in many healthy vaults, so only a
//    loss above 1 bp of totalAssets counts. totalAssets() includes a new loss straight away while
//    lostAssets() stores it only at the next deposit or withdrawal, so a vault whose positions are
//    worth less than 99% of totalAssets() counts as having lost the difference too.
//
// An affected V1 vault counts its positions in the other markets. A V2 vault leaves out what its
// market adapters hold in bricked markets. Every other vault keeps its totalAssets().

const MAX_RATE_AT_TARGET = 63419583967n // AdaptiveCurveIrm cap: 200% APR per second (2e18 / 365 days)
const BRICKED_MIN_RATE_AT_TARGET = MAX_RATE_AT_TARGET / 2n
const BRICKED_MIN_UTILIZATION_BPS = 9900n // 99%
const MATERIAL_LOSS_BPS = 1n
const MIN_HELD_PERCENT = 99n
const TARGET_UTILIZATION = 0.9 // AdaptiveCurveIrm
const ADJUSTMENT_SPEED = 50 // AdaptiveCurveIrm: per year, at full utilisation
const SECONDS_PER_YEAR = 31536000
const VIRTUAL_SHARES = 10n ** 6n // Morpho Blue SharesMathLib
const VIRTUAL_ASSETS = 1n

const abi = {
  MORPHO: 'address:MORPHO',
  lostAssets: 'uint256:lostAssets',
  withdrawQueueLength: 'uint256:withdrawQueueLength',
  withdrawQueue: 'function withdrawQueue(uint256) view returns (bytes32)',
  adaptersLength: 'uint256:adaptersLength',
  adapters: 'function adapters(uint256) view returns (address)',
  realAssets: 'uint256:realAssets',
  morpho: 'address:morpho',
  marketIdsLength: 'uint256:marketIdsLength',
  marketIds: 'function marketIds(uint256) view returns (bytes32)',
  expectedSupplyAssets: 'function expectedSupplyAssets(bytes32) view returns (uint256)',
  balanceOf: 'function balanceOf(address) view returns (uint256)',
  market: 'function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
  idToMarketParams: 'function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
  rateAtTarget: 'function rateAtTarget(bytes32) view returns (int256)',
  position: 'function position(bytes32, address) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
}

const isAddr = (a) => typeof a === 'string' && /^0x[0-9a-fA-F]{40}$/.test(a) && !/^0x0{40}$/.test(a)
const range = (n) => Array.from({ length: Number(n || 0) }, (_, i) => i)
const min = (a, b) => (a < b ? a : b)

async function multi(api, abi, calls) {
  return calls.length ? api.multiCall({ abi, calls, permitFailure: true }) : []
}

function isBricked(market, rateAtTarget, now) {
  if (!market || rateAtTarget == null || BigInt(market.totalSupplyAssets) === 0n) return false
  const utilizationBps = BigInt(market.totalBorrowAssets) * 10000n / BigInt(market.totalSupplyAssets)
  if (utilizationBps < BRICKED_MIN_UTILIZATION_BPS) return false
  // the stored rate at target only moves when the market is touched: bring it forward to now
  const err = (Number(utilizationBps) / 10000 - TARGET_UTILIZATION) / (1 - TARGET_UTILIZATION)
  const elapsed = Math.max(0, now - Number(market.lastUpdate))
  return Number(rateAtTarget) * Math.exp(ADJUSTMENT_SPEED * err * elapsed / SECONDS_PER_YEAR) >= Number(BRICKED_MIN_RATE_AT_TARGET)
}

// Lowers totalAssets[i] (aligned with vaults and assets) for the Morpho vaults that hold bad debt.
async function leaveOutMorphoBadDebt(api, allVaults, allAssets, totalAssets) {
  const index = new Map(allVaults.map((v, i) => [v, i]))
  const vaults = allVaults.filter((_, i) => allAssets[i] && totalAssets[i])
  const assets = new Map(vaults.map((v) => [v, allAssets[index.get(v)]]))
  const totals = new Map(vaults.map((v) => [v, BigInt(totalAssets[index.get(v)])]))
  const [morphos, lostAssets, queueLengths, adaptersLengths] = await Promise.all(
    [abi.MORPHO, abi.lostAssets, abi.withdrawQueueLength, abi.adaptersLength].map((a) => multi(api, a, vaults)))
  const v1 = []
  const v2 = []
  vaults.forEach((vault, i) => {
    if (isAddr(morphos[i]) && queueLengths[i] != null) v1.push({ vault, morpho: morphos[i], lost: BigInt(lostAssets[i] || 0), queueLength: queueLengths[i], positions: [] })
    else if (adaptersLengths[i] != null) v2.push({ vault, adaptersLength: adaptersLengths[i], adapters: [], positions: [] })
  })

  // V1: the vault supplies to the markets of its withdraw queue
  const queue = v1.flatMap((v) => range(v.queueLength).map((j) => ({ v, j })))
  const queueIds = await multi(api, abi.withdrawQueue, queue.map(({ v, j }) => ({ target: v.vault, params: [j] })))
  queue.forEach(({ v }, k) => v.positions.push({ morpho: v.morpho, id: queueIds[k] }))

  // V2: idle assets plus what each adapter holds; market adapters report their assets per market
  const adapterSlots = v2.flatMap((v) => range(v.adaptersLength).map((j) => ({ v, j })))
  const adapterAddrs = await multi(api, abi.adapters, adapterSlots.map(({ v, j }) => ({ target: v.vault, params: [j] })))
  adapterSlots.forEach(({ v }, k) => { if (!isAddr(adapterAddrs[k])) v.incomplete = true })
  const adapters = adapterSlots.map(({ v }, k) => ({ v, address: adapterAddrs[k] })).filter((a) => isAddr(a.address))
  const [realAssets, adapterMorphos, marketCounts, idle] = await Promise.all([
    multi(api, abi.realAssets, adapters.map((a) => a.address)),
    multi(api, abi.morpho, adapters.map((a) => a.address)),
    multi(api, abi.marketIdsLength, adapters.map((a) => a.address)),
    multi(api, abi.balanceOf, v2.map((v) => ({ target: assets.get(v.vault), params: [v.vault] }))),
  ])
  adapters.forEach((a, k) => {
    a.v.adapters.push({ ...a, realAssets: realAssets[k], morpho: adapterMorphos[k], marketCount: marketCounts[k] })
    if (isAddr(adapterMorphos[k]) && marketCounts[k] == null) a.v.incomplete = true // a market adapter whose markets did not load
  })
  v2.forEach((v, i) => { v.idle = idle[i] })
  const adapterMarkets = v2.flatMap((v) => v.adapters).filter((a) => isAddr(a.morpho) && a.marketCount != null)
    .flatMap((a) => range(a.marketCount).map((j) => ({ a, j })))
  const marketIds = await multi(api, abi.marketIds, adapterMarkets.map(({ a, j }) => ({ target: a.address, params: [j] })))
  adapterMarkets.forEach(({ a }, k) => { if (!marketIds[k]) a.v.incomplete = true })
  const withId = adapterMarkets.map(({ a }, k) => ({ a, id: marketIds[k] })).filter((m) => m.id)
  const expected = await multi(api, abi.expectedSupplyAssets, withId.map(({ a, id }) => ({ target: a.address, params: [id] })))
  withId.forEach(({ a, id }, k) => a.v.positions.push({ morpho: a.morpho, id, assets: expected[k] }))

  // the state of every market involved and whether it is bricked
  const keyOf = (p) => `${p.morpho}:${p.id}`.toLowerCase()
  const markets = [...new Map([...v1, ...v2].flatMap((v) => v.positions).filter((p) => p.id).map((p) => [keyOf(p), p])).values()]
  const [states, params] = await Promise.all([abi.market, abi.idToMarketParams].map((a) => multi(api, a, markets.map((m) => ({ target: m.morpho, params: [m.id] })))))
  const withIrm = markets.map((m, i) => ({ m, i })).filter(({ i }) => isAddr(params[i]?.irm))
  const rates = await multi(api, abi.rateAtTarget, withIrm.map(({ m, i }) => ({ target: params[i].irm, params: [m.id] })))
  const marketInfo = new Map(markets.map((m, i) => [keyOf(m), { state: states[i], params: params[i], bricked: false }]))
  const loaded = (p) => marketInfo.get(keyOf(p))?.state && marketInfo.get(keyOf(p))?.params
  const now = api.timestamp || Math.floor(Date.now() / 1000)
  withIrm.forEach(({ m, i }, k) => { marketInfo.get(keyOf(m)).bricked = isBricked(states[i], rates[k], now) })

  const values = new Map()

  const v1Positions = v1.flatMap((v) => v.positions.map((p) => ({ v, p }))).filter(({ p }) => p.id)
  const shares = await multi(api, abi.position, v1Positions.map(({ v, p }) => ({ target: p.morpho, params: [p.id, v.vault] })))
  v1Positions.forEach(({ p }, k) => {
    const state = marketInfo.get(keyOf(p))?.state
    if (shares[k] && state) p.assets = BigInt(shares[k].supplyShares) * (BigInt(state.totalSupplyAssets) + VIRTUAL_ASSETS) / (BigInt(state.totalSupplyShares) + VIRTUAL_SHARES)
  })
  for (const v of v1) {
    if (v.positions.some((p) => p.assets == null || !loaded(p))) continue // incomplete read: keep totalAssets()
    const total = totals.get(v.vault)
    const bricked = v.positions.filter((p) => marketInfo.get(keyOf(p)).bricked)
    const held = v.positions.reduce((sum, p) => sum + p.assets, 0n)
    const lostSome = v.lost * 10000n > total * MATERIAL_LOSS_BPS || held * 100n < total * MIN_HELD_PERCENT
    if (!lostSome && !bricked.some((p) => p.assets > 0n)) continue
    const good = v.positions.filter((p) => !bricked.includes(p)).reduce((sum, p) => sum + p.assets, 0n)
    values.set(v.vault, min(good, total > v.lost ? total - v.lost : 0n))
  }

  for (const v of v2) {
    if (v.incomplete || v.idle == null || v.adapters.some((a) => a.realAssets == null) || v.positions.some((p) => p.assets == null || !loaded(p))) continue
    const bricked = v.positions.filter((p) => marketInfo.get(keyOf(p))?.bricked).reduce((sum, p) => sum + BigInt(p.assets), 0n)
    if (bricked === 0n) continue
    const real = v.adapters.reduce((sum, a) => sum + BigInt(a.realAssets), BigInt(v.idle))
    values.set(v.vault, min(real > bricked ? real - bricked : 0n, totals.get(v.vault)))
  }

  for (const [vault, value] of values) totalAssets[index.get(vault)] = value
}

module.exports = {
  leaveOutMorphoBadDebt,
}
