const { dexExport, getResources } = require('../helper/chain/aptos')
const sui = require('../helper/chain/sui')
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
    const [token0, token1] = val.type.split('::pool::Pool<')[1].replace('>', '').split(', ')
    data.push({
      token0,
      token1,
      token0Bal: val.data.coin_a.value,
      token1Bal: val.data.coin_b.value,
    })
  }
}

async function suiTVL() {
  const { api } = arguments[3]
  const poolObjectID = '0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0'
  const { fields: { list: { fields: listObject } } } = await sui.getObject(poolObjectID)
  const items = (await sui.getDynamicFieldObjects({ parent: listObject.id.id })).map(i => i.fields.value.fields.value)
  const poolInfo = await sui.getObjects(items.map(i => i.fields.pool_id))
  poolInfo.forEach(({ type: typeStr, fields }) => {
    const [coinA, coinB] = typeStr.replace('>', '').split('<')[1].split(', ')
    api.add(coinA, fields.coin_a)
    api.add(coinB, fields.coin_b)
  })
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
  },
  sui: {
    tvl: suiTVL,
  }
}