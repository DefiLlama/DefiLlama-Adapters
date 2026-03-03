const sui = require('../helper/chain/sui')

async function suiTVL(api) {
  const poolObjectID = '0x0efb954710df6648d090bdfa4a5e274843212d6eb3efe157ee465300086e3650'
  const { fields: { list: { fields: listObject } } } = await sui.getObject(poolObjectID)
  const items = (await sui.getDynamicFieldObjects({ parent: listObject.id.id })).map(i => i.fields.value.fields.value)
  const poolInfo = await sui.getObjects(items.map(i => i.fields.pool_id))
  poolInfo.forEach(({ type: typeStr, fields }) => {
    const [coinA, coinB] = typeStr.replace('>', '').split('<')[1].split(', ')
    api.add(coinA, fields.coin_a)
    api.add(coinB, fields.coin_b)
  })
}

module.exports = {
  sui: {
    tvl: suiTVL,
  }
}