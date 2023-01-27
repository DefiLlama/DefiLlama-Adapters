const { dexExport, getResources } = require('../helper/chain/aptos')
const { transformDexBalances } = require('../helper/portedTokens')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')

async function tvl() {
  let data = await getResources('0xa7f01413d33ba919441888637ca1607ca0ddcbfa3c0a9ddea64743aaa560e498')
  const poolAddresses = data.find(i => i.type.includes('::factory::Pools')).data.data.data.map(i => i.value)
  data = []
  await PromisePool
    .withConcurrency(7)
    .for(poolAddresses)
    .process(addPool)

  return transformDexBalances({ chain: 'aptos', data })

  async function addPool(poolAddr) {
    const res = await getResources(poolAddr)
    const val = res.find(i => i.type.includes('::pool::Pool'))
    const [token0, token1 ] = val.type.split('::pool::Pool<')[1].replace('>', '').split(', ')
    data.push({
      token0, 
      token1,
      token0Bal: val.data.coin_a.value,
      token1Bal: val.data.coin_b.value,
    })
  }
}

module.exports = dexExport({
  account: '0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba',
  poolStr: 'amm_swap::Pool<',
  token0Reserve: i => i.data.coin_a.value,
  token1Reserve: i => i.data.coin_b.value,
})

module.exports = {
  aptos: {
    tvl: sdk.util.sumChainTvls([module.exports.aptos.tvl, tvl])
  }
}