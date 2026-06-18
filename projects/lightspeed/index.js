const { get } = require('../helper/http')

const EXCHANGE_API = 'https://api.templedigitalgroup.com/api/exchange'
const ORDERBOOK_DEPTH = 10000
const CONCURRENCY_LIMIT = 10
const DECIMALS = 12
const SCALE = 10n ** 12n
const GAS_TOKEN_SCALE = 10n ** 18n

const CG_TOKENS = {
  CBTC: 'bitcoin',
  USDA: 'usd-coin',
  USDCx: 'usd-coin',
}

function parseFixed(value) {
  const normalized = String(value)
  const sign = normalized.startsWith('-') ? -1n : 1n
  const [whole, fraction = ''] = normalized.replace(/^-/, '').split('.')
  const wholeValue = BigInt(whole || 0)
  const fractionValue = BigInt(fraction.padEnd(DECIMALS, '0').slice(0, DECIMALS) || 0)

  return sign * (wholeValue * SCALE + fractionValue)
}

function multiplyFixed(a, b) {
  return (a * b) / SCALE
}

function toNumber(amount) {
  return Number(amount) / Number(SCALE)
}

function toGasTokenAmount(amount) {
  return ((amount * GAS_TOKEN_SCALE) / SCALE).toString()
}

function addAsset(api, asset, amount) {
  if (amount <= 0n) return
  if (asset === 'CC') return api.addGasToken(toGasTokenAmount(amount))

  const cgToken = CG_TOKENS[asset]
  if (!cgToken) {
    api.log?.(`Skipping unmapped Lightspeed asset ${asset}`)
    return
  }

  api.addCGToken(cgToken, toNumber(amount))
}

function addAmount(amounts, asset, amount) {
  if (amount <= 0n) return
  amounts[asset] = (amounts[asset] || 0n) + amount
}

async function fetchOrderbooks(tickers) {
  const orderbooks = []

  for (let index = 0; index < tickers.length; index += CONCURRENCY_LIMIT) {
    const chunk = tickers.slice(index, index + CONCURRENCY_LIMIT)
    const chunkOrderbooks = await Promise.all(
      chunk.map(async (ticker) => ({
        ticker,
        orderbook: await get(`${EXCHANGE_API}/orderbook?ticker_id=${encodeURIComponent(ticker.ticker_id)}&depth=${ORDERBOOK_DEPTH}`),
      }))
    )

    orderbooks.push(...chunkOrderbooks)
  }

  return orderbooks
}

async function tvl(api) {
  const tickers = await get(`${EXCHANGE_API}/tickers`)
  const amounts = {}
  const orderbooks = await fetchOrderbooks(tickers)

  for (const { ticker, orderbook } of orderbooks) {
    for (const [price, quantity] of orderbook.bids || []) {
      addAmount(amounts, ticker.target_currency, multiplyFixed(parseFixed(price), parseFixed(quantity)))
    }

    for (const [, quantity] of orderbook.asks || []) {
      addAmount(amounts, ticker.base_currency, parseFixed(quantity))
    }
  }

  Object.entries(amounts).forEach(([asset, amount]) => addAsset(api, asset, amount))
}

module.exports = {
  timetravel: false,
  canton: { tvl },
  methodology:
    "TVL is the current resting liquidity on Lightspeed's public spot orderbooks. Bid-side liquidity is counted as quote assets, ask-side liquidity is counted as base assets, and all listed Lightspeed markets are fetched from Temple's public exchange-listing API.",
}
