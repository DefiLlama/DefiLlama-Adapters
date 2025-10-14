const sui = require('../helper/chain/sui')

async function suiTVL(api) {
  const poolObjectID = '0xb1d55e7d895823c65f98d99b81a69436cf7d1638629c9ccb921326039cda1f1b'
  const { fields: { pools: { fields: listObject } } } = await sui.getObject(poolObjectID)
  const items = (await sui.getDynamicFieldObjects({ parent: listObject.id.id })).map(i => i.fields.value.fields.value)
  const poolInfo = await sui.getObjects(items.map(i => i.fields.pool_id))
  poolInfo.forEach(({ type: typeStr, fields }) => {
    const [coinA, coinB] = typeStr.replace('>', '').split('<')[1].split(', ')
    api.add(coinA, fields.balance_a)
    api.add(coinB, fields.balance_b)
  })
}



module.exports = {
  sui: {
    tvl: suiTVL,
  }
}