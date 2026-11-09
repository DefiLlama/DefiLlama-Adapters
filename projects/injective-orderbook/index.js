const { getOrderBookTvl, TYPES } = require('./util')

module.exports = {
  timetravel: false,
  methodology: 'TVL is the balance of the Injective exchange module account, which holds all trader deposits and margin for spot and derivatives markets.',
  injective: {
    tvl: getOrderBookTvl(TYPES.DERIVATIVES),
  }
}