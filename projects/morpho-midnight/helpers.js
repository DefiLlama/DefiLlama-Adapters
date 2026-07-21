const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const WAD = 10n ** 18n
const WAD_SQUARED = 10n ** 36n
const LN_ONE_PLUS_DELTA = 4_987_541_511_039_073n
const LN2 = 693_147_180_559_945_309n
const WEXP_OFFSET = 322_611_214_989_459_870n
const PRICE_STEP = 10n ** 11n
const HALF_TICK_RANGE = 3372n
const MAX_TICK = 6744

function add(map, key, delta) {
  key = key.toLowerCase()
  map.set(key, (map.get(key) ?? 0n) + BigInt(delta))
}

function divHalfDownUnchecked(x, d) {
  return (x + (d - 1n) / 2n) / d
}

function wExp(x) {
  if (x < 0n) return WAD_SQUARED / wExp(-x)
  const q = (x + WEXP_OFFSET) / LN2
  const r = x - q * LN2
  const secondTerm = (r * r) / (2n * WAD)
  const thirdTerm = (secondTerm * r) / (3n * WAD)
  return (WAD + r + secondTerm + thirdTerm) << q
}

function tickToPrice(tick) {
  if (!Number.isInteger(tick) || tick < 0 || tick > MAX_TICK)
    throw new Error(`Invalid Midnight tick: ${tick}`)
  const exponent = LN_ONE_PLUS_DELTA * (HALF_TICK_RANGE - BigInt(tick))
  return divHalfDownUnchecked(
    divHalfDownUnchecked(WAD_SQUARED, WAD + wExp(exponent)),
    PRICE_STEP,
  ) * PRICE_STEP
}

function unitsToAssets(units, tick, buy) {
  const scaled = BigInt(units) * tickToPrice(tick)
  return buy ? scaled / WAD : (scaled + WAD - 1n) / WAD
}

function getBorrowedByMarket(takes, repays, liquidations) {
  const borrowed = new Map()
  // `Take.units` also covers secondary transfers. `totalUnitsDelta` is the exact change in
  // aggregate debt/credit created or closed by the match.
  takes.forEach(log => add(borrowed, log.id_, log.totalUnitsDelta))
  repays.forEach(log => add(borrowed, log.id_, -BigInt(log.units)))
  liquidations.forEach(log =>
    add(borrowed, log.id_, -(BigInt(log.repaidUnits) + BigInt(log.badDebt))),
  )
  for (const [marketId, amount] of borrowed)
    if (amount < 0n) throw new Error(`Negative Midnight debt for market ${marketId}`)
  return borrowed
}

function getOnchainTvlByToken({ markets, suppliedCollateral, withdrawnCollateral, liquidations, repays, withdrawals, claimedContinuousFees }) {
  const balances = new Map()
  const loanToken = id => {
    const market = markets.get(id.toLowerCase())
    if (!market) throw new Error(`Missing Midnight market ${id}`)
    return market.loanToken
  }
  suppliedCollateral.forEach(log => add(balances, log.collateral, log.assets))
  withdrawnCollateral.forEach(log => add(balances, log.collateral, -BigInt(log.assets)))
  liquidations.forEach(log => {
    add(balances, log.collateral, -BigInt(log.seizedAssets))
    add(balances, loanToken(log.id_), log.repaidUnits)
  })
  repays.forEach(log => add(balances, loanToken(log.id_), log.units))
  withdrawals.forEach(log => add(balances, loanToken(log.id_), -BigInt(log.units)))
  claimedContinuousFees.forEach(log => add(balances, loanToken(log.id_), -BigInt(log.amount)))
  for (const [token, amount] of balances)
    if (amount < 0n) throw new Error(`Negative Midnight TVL balance for token ${token}`)
  return balances
}

function getOpenOfferRequests(rows) {
  const groups = new Map()
  for (const row of rows) {
    const offer = row.offer
    if (!offer?.buy || BigInt(row.units) <= 0n) continue
    // Router can only prove backing for callback-free offers today. Excluding callbacks also
    // prevents future Blue-backed callback liquidity from being counted in both protocols.
    if ((offer.callback ?? ZERO_ADDRESS).toLowerCase() !== ZERO_ADDRESS) continue
    const maker = offer.maker.toLowerCase()
    const loanToken = offer.market.loan_token.toLowerCase()
    const midnight = offer.market.midnight.toLowerCase()
    const group = offer.group.toLowerCase()
    const capKey = `${midnight}:${loanToken}:${maker}`
    const groupKey = `${capKey}:${group}`
    const assets = unitsToAssets(row.units, offer.tick, true)
    const previous = groups.get(groupKey)
    // A Multi-Market Offer repeats one shared group budget across markets. Its maximum
    // executable asset amount is counted once, not once per market leg.
    if (!previous || assets > previous.assets)
      groups.set(groupKey, { capKey, maker, loanToken, midnight, assets })
  }
  const requests = new Map()
  for (const group of groups.values()) {
    const request = requests.get(group.capKey) ?? { ...group, assets: 0n }
    request.assets += group.assets
    requests.set(group.capKey, request)
  }
  return [...requests.values()]
}

function capOpenOfferRequests(requests, balances, allowances) {
  return requests.map((request, index) => ({
    ...request,
    assets: [request.assets, BigInt(balances[index] ?? 0), BigInt(allowances[index] ?? 0)]
      .reduce((minimum, value) => value < minimum ? value : minimum),
  }))
}

module.exports = { MAX_TICK, ZERO_ADDRESS, capOpenOfferRequests, getBorrowedByMarket, getOnchainTvlByToken, getOpenOfferRequests, tickToPrice, unitsToAssets }
