const { dexExport } = require('../helper/chain/aptos')

module.exports = dexExport({
  account: '0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba',
  poolStr: 'amm_swap::Pool<',
  token0Reserve: i => i.data.coin_a.value,
  token1Reserve: i => i.data.coin_b.value,
})