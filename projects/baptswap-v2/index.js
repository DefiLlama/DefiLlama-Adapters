const { dexExport } = require('../helper/chain/aptos')

// fetch data from BaptSwap resource account
module.exports = dexExport({
  account: '0x6ee5ff12d9af89de4cb9f127bc4c484d26acda56c03536b5e3792eac94da0a36',
  poolStr: 'swap_v2::TokenPairMetadata',
  token0Reserve: i => i.data.balance_x.value,
  token1Reserve: i => i.data.balance_y.value,
})