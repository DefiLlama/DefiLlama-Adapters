const { dexExport } = require('../helper/chain/aptos')

// fetch data from BaptSwap resource account
module.exports = dexExport({
  account: '0xe52923154e25c258d9befb0237a30b4001c63dc3bb73011c29cb3739befffcef',
  poolStr: 'swap_v2dot1::TokenPairMetadata',
  token0Reserve: i => i.data.balance_x.value,
  token1Reserve: i => i.data.balance_y.value,
})