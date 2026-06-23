const sui = require("../helper/chain/sui");

const tvl = async (api) => {
  const poolObjectID = '0x73d72382b41b5c50442722ecab7962fc3ef2bad7e91e59ea26bcba897bcd1826'
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
  sui: { tvl }
}