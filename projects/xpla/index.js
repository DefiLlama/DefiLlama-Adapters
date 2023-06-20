const { getFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  xpla: {
    tvl: getFactoryTvl('xpla1j33xdql0h4kpgj2mhggy4vutw655u90z7nyj4afhxgj4v5urtadq44e3vd')
  },
}