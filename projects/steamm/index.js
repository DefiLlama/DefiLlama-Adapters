const sui = require('../helper/chain/sui')

async function tvl(api) {
  const poolIds = await getPoolIds()
  const btokenMapping = await getBTokenMapping()

  for (const poolId of poolIds) {
    const poolObject = await sui.getObject(poolId)
    const { balance_a: balanceA, balance_b: balanceB } = poolObject.fields

    const poolType = poolObject.type
    const poolComponents = poolType.split('pool::Pool<')[1]
    if (!poolComponents) continue

    const [btokenA, btokenB] = poolComponents.split(',').map(s => s.trim())
    const coinTypeA = btokenMapping[btokenA]
    const coinTypeB = btokenMapping[btokenB]

    if (!coinTypeA || !coinTypeB) continue

    api.add(coinTypeA, balanceA)
    api.add(coinTypeB, balanceB)
  }
}

async function getPoolIds() {
  const page = await sui.getDynamicFieldObjects({ parent: '0x8b0a90c71b7993522e609c40df29bc5bf476609c026b74b2ae4572d05e4416a2' })
  const poolInfos = await sui.getObjects(page.map(d => d.fields.id.id))
  return poolInfos.flatMap(info => info.fields.value.fields.contents.map(item => item.fields.pool_id))
}

async function getBTokenMapping() {
  const page = await sui.getDynamicFieldObjects({ parent: '0x57a91701ee289638e41eb8bfa439edec210085ce822a4d8a629f9e64f5801734' })

  const bTokenToCoinType = {}
  for (const data of page) {
    const btokenType = '0x' + data.fields.value.fields.btoken_type.fields.name
    const coinType = '0x' + data.fields.name.fields.coin_type.fields.name
    bTokenToCoinType[btokenType] = coinType
  }
  return bTokenToCoinType
}

module.exports = {
  timetravel: false,
  sui: { tvl },
}
