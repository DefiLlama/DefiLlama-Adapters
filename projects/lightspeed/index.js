const { get } = require('../helper/http')

const EXCHANGE_API = 'https://api.templedigitalgroup.com/api/exchange'
const ORDERBOOK_DEPTH = 10000

const CG_TOKENS = {
  CBTC: 'bitcoin',
  USDA: 'usd-coin',
  USDCx: 'usd-coin',
}

function addAsset(api, asset, amount) {
  if (!amount) return
  if (asset === 'CC') return api.addGasToken(amount * 1e18)
  if (!CG_TOKENS[asset]) throw new Error(`Missing pricing mapping for ${asset}`)
  api.addCGToken(CG_TOKENS[asset], amount)
}

function addAmount(amounts, asset, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return
  amounts[asset] = (amounts[asset] || 0) + amount
}

async function tvl(api) {
  const tickers = await get(`${EXCHANGE_API}/tickers`)
  const amounts = {}

  for (const ticker of tickers) {
    const orderbook = await get(`${EXCHANGE_API}/orderbook?ticker_id=${ticker.ticker_id}&depth=${ORDERBOOK_DEPTH}`)

    for (const [price, quantity] of orderbook.bids || []) {
      addAmount(amounts, ticker.target_currency, Number(price) * Number(quantity))
    }

    for (const [, quantity] of orderbook.asks || []) {
      addAmount(amounts, ticker.base_currency, Number(quantity))
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
