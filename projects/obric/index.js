const { dexExport } = require('../helper/chain/aptos')

module.exports = dexExport({
  account: '0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b',
  poolStr: 'piece_swap::PieceSwapPoolInfo',
  token0Reserve: i => i.data.reserve_x.value,
  token1Reserve: i => i.data.reserve_y.value,
})
