const { getMarkets, getOrders } = require('../helper/injective')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

async function tvl() {
  const balances = {}
  const markets = await getMarkets()
  const orders = await getOrders({ marketIds: markets.map(i => i.marketId) })
  const marketObj = {}
  const tokens = {}
  for (const market of markets) {
    const { baseDenom, quoteDenom, quoteToken, baseToken } = market
    marketObj[market.marketId] = market
    if (!quoteToken) console.log('missing token quote', quoteDenom)
    else tokens[quoteDenom] = { addr: quoteDenom, ...quoteToken }
    if (!baseToken) console.log('missing token base', baseDenom)
    else tokens[baseDenom] = { addr: baseDenom, ...baseToken }
  }
  for (const order of orders) marketObj[order.marketId].orderbook = order.orderbook
  for (const { quoteDenom, baseDenom, orderbook: { buys, sells, } } of markets) {
    for (const { price, quantity } of buys)
      sdk.util.sumSingleBalance(balances, quoteDenom, BigNumber(quantity * price).toFixed(0))
    for (const { quantity } of sells)
      sdk.util.sumSingleBalance(balances, baseDenom, BigNumber(quantity).toFixed(0))

  }
  return transformBalances('injective', balances)
}

module.exports = {
  timetravel: false,
  injective: {
    tvl
  }
}