const { getMultiFactoryTvl } = require('../terraswap/factoryTvl')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  orai: {
    tvl: getMultiFactoryTvl(["orai1hemdkz4xx9kukgrunxu3yw0nvpyxf34v82d2c8", "orai1jyewd8d0csggqxc3yf79e4kwy3z3p6zxyn0f35j3u42etrxzrtuqcu85sm"])
  },
}