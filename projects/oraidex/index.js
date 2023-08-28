const { getFactoryTvl } = require('../terraswap/factoryTvl')
const sdk = require('@defillama/sdk')
const factories = ["orai1hemdkz4xx9kukgrunxu3yw0nvpyxf34v82d2c8", 'orai167r4ut7avvgpp3rlzksz6vw5spmykluzagvmj3ht845fjschwugqjsqhst']

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX",
  orai: {
    tvl: sdk.util.sumChainTvls(factories.map(getFactoryTvl))
  },
}