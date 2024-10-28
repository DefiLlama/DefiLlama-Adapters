const { getOrderBookTvl, TYPES } = require('./util')

module.exports = {
  timetravel: false,
  injective: {
    tvl: getOrderBookTvl(TYPES.SPOT),
  }
}