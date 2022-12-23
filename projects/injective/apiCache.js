const { getMarkets, getOrders, TYPES } = require('../helper/chain/injectve')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

function getOrderBookTvl(typeStr) {
  return async () => {
    const balances = {}
    const markets = await getMarkets({ type: typeStr })
    const orders = await getOrders({ type: typeStr, marketIds: markets.map(i => i.marketId) })
    const marketObj = {}
    for (const market of markets)
      marketObj[market.marketId] = market

    for (const order of orders) marketObj[order.marketId].orderbook = order.orderbook
    for (const { quoteDenom, baseDenom, orderbook: { buys, sells, } } of markets) {
      for (const { price, quantity } of buys)
        sdk.util.sumSingleBalance(balances, quoteDenom, BigNumber(quantity * price).toFixed(0))

      for (const { quantity } of sells) {

        if (typeStr === TYPES.SPOT) {
          sdk.util.sumSingleBalance(balances, baseDenom, BigNumber(quantity).toFixed(0))
        } else if (typeStr === TYPES.DERIVATIVES) {
          const price = buys.length ? buys[0].price : 0
          sdk.util.sumSingleBalance(balances, quoteDenom, BigNumber(quantity * price).toFixed(0))
        }
      }
    }
    return transformBalances('injective', balances)
  }
}

module.exports = {
  timetravel: false,
  injective: {
    tvl: sdk.util.sumChainTvls([
      getOrderBookTvl(TYPES.SPOT),
      getOrderBookTvl(TYPES.DERIVATIVES)
    ])
  }
}