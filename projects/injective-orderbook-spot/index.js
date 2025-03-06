const { getOrderBookTvl, TYPES } = require('../injective-orderbook/util')

module.exports = {
  timetravel: false,
  injective: {
    tvl: getOrderBookTvl(TYPES.SPOT),
  }
}