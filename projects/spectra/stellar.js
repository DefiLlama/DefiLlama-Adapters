const { callSoroban } = require('../helper/chain/stellar')
const { get } = require('../helper/http')

const REGISTRY = 'CCUGRASBWD5SXDYMS7NM437FQ7KNKHFX74D2VRJVTRU4J2TWDMURUW3V'
const ORDERS_API = 'https://api.spectra.finance/v1/stellar/limit-orders/orders'
const PAGE_SIZE = 1000

// IbtForPt (1) and IbtForYt (3) are funded with the IBT leg. PT/YT sell orders
// are skipped: those tokens are backed by PT collateral that is already counted.
const FUNDING_ORDER_TYPES = [1, 3]
const LIVE_STATUSES = new Set(['open', 'partially_filled'])
const MAKER_TOKEN = { IBT: 0, VAULT_SHARE: 1, UNDERLYING: 2 }

const i128 = (value) => ({ type: 'i128', value })

async function tvl(api) {
  const markets = await addPrincipalTokens(api)
  await addBuyOrders(api, markets)
}

async function addPrincipalTokens(api) {
  const count = await callSoroban(REGISTRY, 'get_pt_count')
  const markets = new Map()

  for (let i = 0; i < count; i++) {
    const pt = await callSoroban(REGISTRY, 'get_pt_at', [i])
    // Registry indices are append-only; removing a PT leaves an empty slot.
    if (!pt || markets.has(pt)) continue

    const [underlying, ibt, assets] = await Promise.all([
      callSoroban(pt, 'underlying'),
      callSoroban(pt, 'get_ibt'),
      // total_assets values only this PT's IBT holdings via preview_redeem.
      // Include matured PTs while collateral remains in the contract.
      callSoroban(pt, 'total_assets'),
    ])
    markets.set(pt, { underlying, ibt })
    api.add(underlying, assets.toString())
  }
  return markets
}

// Open buy orders are non-custodial: the engine pulls maker funds only on fill.
// Count what is actually fillable: per maker and funding token, the order total
// capped by the maker's balance and its allowance to the engine, so orders that
// share one balance (several maturities, or USDC across markets) count it once.
async function addBuyOrders(api, markets) {
  const orders = await getBuyOrders()
  const tokens = new Map()
  const commitments = new Map()

  for (const order of orders) {
    const market = markets.get(order.ptAddress)
    if (!market || !FUNDING_ORDER_TYPES.includes(order.orderType) || !LIVE_STATUSES.has(order.orderStatus)) continue
    const remaining = BigInt(order.makingAmount) - BigInt(order.filledAmount)
    if (remaining <= 0n) continue

    const type = order.makerTokenType
    const tokenKey = `${market.ibt}|${type}`
    if (!tokens.has(tokenKey)) tokens.set(tokenKey, makingToken(market, type))
    const token = await tokens.get(tokenKey)

    const key = `${order.makerAddress}|${token}`
    const commitment = commitments.get(key) ?? { maker: order.makerAddress, token, amount: 0n, legs: new Map() }
    const legKey = `${order.ptAddress}|${type}`
    const leg = commitment.legs.get(legKey) ?? { market, type, amount: 0n }
    leg.amount += remaining
    commitment.amount += remaining
    commitment.legs.set(legKey, leg)
    commitments.set(key, commitment)
  }
  if (!commitments.size) return

  const engine = await callSoroban(REGISTRY, 'get_limit_order_engine')
  for (const { maker, token, amount, legs } of commitments.values()) {
    const [balance, allowance] = await Promise.all([
      callSoroban(token, 'balance', [maker]),
      callSoroban(token, 'allowance', [maker, engine]),
    ])
    const fundable = [amount, BigInt(balance), BigInt(allowance)].reduce((a, b) => (a < b ? a : b))
    if (fundable <= 0n) continue

    // Split the fundable amount across markets pro rata, then value each part.
    for (const { market, type, amount: legAmount } of legs.values()) {
      const part = (legAmount * fundable) / amount
      if (part > 0n) api.add(market.underlying, (await toUnderlying(market, type, part)).toString())
    }
  }
}

async function getBuyOrders() {
  const orders = []
  // The API filters status after the database page, so a short page does not
  // mean the end. Page by order type only and stop on an empty page.
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { success, orders: page } = await get(`${ORDERS_API}?orderTypes=${FUNDING_ORDER_TYPES.join(',')}&limit=${PAGE_SIZE}&offset=${offset}`)
    if (!success || !Array.isArray(page)) throw new Error('Spectra Stellar orders API returned no orders')
    if (!page.length) return orders
    orders.push(...page)
  }
}

async function makingToken(market, type) {
  if (type === MAKER_TOKEN.IBT) return market.ibt
  if (type === MAKER_TOKEN.UNDERLYING) return market.underlying
  if (type === MAKER_TOKEN.VAULT_SHARE) return callSoroban(market.ibt, 'query_asset')
  throw new Error(`Unknown Spectra maker token type: ${type}`)
}

// Value orders the way the engine converts them on fill: vault shares wrap
// into IBT, and IBT is priced in underlying like PT collateral.
async function toUnderlying(market, type, amount) {
  if (type === MAKER_TOKEN.UNDERLYING) return amount
  const ibtAmount = type === MAKER_TOKEN.VAULT_SHARE ? await callSoroban(market.ibt, 'preview_wrap', [i128(amount)]) : amount
  return callSoroban(market.ibt, 'preview_redeem', [i128(BigInt(ibtAmount))])
}

module.exports = { timetravel: false, tvl }
