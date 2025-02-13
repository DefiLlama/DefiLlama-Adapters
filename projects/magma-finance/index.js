const sui = require('../helper/chain/sui')

async function suiTVL(api) {
  const poolObjectID = '0xfa145b9de10fe858be81edd1c6cdffcf27be9d016de02a1345eb1009a68ba8b2'
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
