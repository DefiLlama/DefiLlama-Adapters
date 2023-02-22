const { getFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  orai: {
    tvl: getFactoryTvl("orai1hemdkz4xx9kukgrunxu3yw0nvpyxf34v82d2c8")
  },
}