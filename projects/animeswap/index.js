const { dexExport } = require('../helper/chain/aptos')
const { dexExport: dexExportSUI } = require('../helper/chain/sui')
const { mergeExports } = require('../helper/utils')

const aptosExports = dexExport({
  account: '0x796900ebe1a1a54ff9e932f19c548f5c1af5c6e7d34965857ac2f7b1d1ab2cbf',
  poolStr: 'AnimeSwapPoolV1::LiquidityPool',
})

const suiExprots = dexExportSUI({
  account: '0xdd7e3a071c6a090a157eccc3c9bbc4d2b3fb5ac9a4687b1c300bf74be6a58945',
  poolStr: 'animeswap::LiquidityPool',
})

module.exports = mergeExports([suiExprots, aptosExports])
