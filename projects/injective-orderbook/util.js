const { injective: { getMarkets, getOrders } } = require('../helper/chain/rpcProxy')

const TYPES = {
  BANK: 'BANK',
  SPOT: 'SPOT',
  DERIVATIVES: 'DERIVATIVES',
}

function getOrderBookTvl(typeStr) {
  return async (api) => {
    const markets = await getMarkets({ type: typeStr })
    const orders = await getOrders({ type: typeStr, marketIds: markets.map(i => i.marketId) })
    const marketObj = {}
    for (const market of markets)
      marketObj[market.marketId] = market

    for (const order of orders) marketObj[order.marketId].orderbook = order.orderbook
    for (const { quoteDenom, baseDenom, orderbook: { buys, sells, } } of markets) {
      for (const { price, quantity } of buys)
        api.add(quoteDenom, Math.floor(quantity * price))

      for (const { quantity } of sells) {

        if (typeStr === TYPES.SPOT) {
          api.add(baseDenom, Math.floor(quantity))
        } else if (typeStr === TYPES.DERIVATIVES) {
          const price = buys.length ? buys[0].price : 0
          api.add(quoteDenom, Math.floor(quantity * price))
        }
      }
    }
    return api.getBalances()
  }
}

module.exports = {
  TYPES,
  getOrderBookTvl
}