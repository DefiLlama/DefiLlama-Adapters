const { getMarkets, getOrders, TYPES } = require('../helper/chain/injective')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')

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
        api.add(quoteDenom, BigNumber(quantity * price).toFixed(0))

      for (const { quantity } of sells) {

        if (typeStr === TYPES.SPOT) {
          api.add(baseDenom, BigNumber(quantity).toFixed(0))
        } else if (typeStr === TYPES.DERIVATIVES) {
          const price = buys.length ? buys[0].price : 0
          api.add(quoteDenom, BigNumber(quantity * price).toFixed(0))
        }
      }
    }
    return api.getBalances()
  }
}

module.exports = {
  timetravel: false,
  injective: {
    tvl: sdk.util.sumChainTvls([
      getOrderBookTvl(TYPES.SPOT),
      getOrderBookTvl(TYPES.DERIVATIVES),
    ])
  }
}
