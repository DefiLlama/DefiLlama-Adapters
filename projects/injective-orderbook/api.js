const { getMarkets, getOrders, formatTokenAmounts, TYPES } = require('../helper/chain/injective')
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
    return formatTokenAmounts(balances)
  }
}

async function mergeAndSumAmounts() {
  const spotAmounts = await getOrderBookTvl(TYPES.SPOT)()
  const derivativesAmounts = await getOrderBookTvl(TYPES.DERIVATIVES)()
  const coinGeckoIdList = new Set([...Object.keys(spotAmounts), ...Object.keys(derivativesAmounts)])

  return Array.from(coinGeckoIdList).reduce((tvlMap, coinGeckoId) => {
    const spotAmount = new BigNumber(spotAmounts[coinGeckoId] || 0)
    const derivativesAmount = new BigNumber(derivativesAmounts[coinGeckoId] || 0);
    tvlMap[coinGeckoId] = spotAmount.plus(derivativesAmount).toFixed(2)
    return tvlMap
  }, {})
}

module.exports = {
  timetravel: false,
  injective: {
    tvl: () => mergeAndSumAmounts()
  }
}
