const { getSeiDexTvl } = require('../terraswap/factoryTvl')

module.exports = {
  timetravel: false,
  methodology: "Liquidity on the DEX",
  sei: {
    tvl: getSeiDexTvl(86),
  },
}
