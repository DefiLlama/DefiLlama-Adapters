const { dexExport } = require('../helper/chain/aptos')

// fetch data from BaptSwap resource account
module.exports = dexExport({
  account: '0x2ad8f7e64c7bffcfe94d7dea84c79380942c30e13f1b12c7a89e98df91d0599b',
  poolStr: 'swap::TokenPairMetadata',
  token0Reserve: i => i.data.balance_x.value,
  token1Reserve: i => i.data.balance_y.value,
})