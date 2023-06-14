const { dexExport } = require('../helper/chain/aptos')
const sdk = require('@defillama/sdk')

module.exports = {
  aptos: {
    tvl: sdk.util.sumChainTvls([
      dexExport({
        account: '0x05a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948',
        poolStr: 'liquidity_pool::LiquidityPool',
      }).aptos.tvl,
      dexExport({
        account: '0x61d2c22a6cb7831bee0f48363b0eec92369357aece0d1142062f7d5d85c7bef8',
        poolStr: 'liquidity_pool::LiquidityPool',
      }).aptos.tvl
    ])
  }
}
