const { dexExport } = require('../helper/chain/aptos')

module.exports = dexExport({
  account: '0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c',
  poolStr: 'swap::TokenPairReserve',
  token0Reserve: i => i.data.reserve_x,
  token1Reserve: i => i.data.reserve_y,
})