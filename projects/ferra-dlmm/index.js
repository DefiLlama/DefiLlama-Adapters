const sui = require("../helper/chain/sui");

const tvl = async (api) => {
  const poolObjectID = '0x71ae968a99fd9a0b6a46519d7875fcc454c9811a3a6da8114382e6d926e78a04'
  const { fields: { list: { fields: listObject } } } = await sui.getObject(poolObjectID)
  const items = (await sui.getDynamicFieldObjects({ parent: listObject.id.id })).map(i => i.fields.value.fields)
  const poolInfo = await sui.getObjects(items.map(i => i.pair_id))
  poolInfo.forEach(({ type: typeStr, fields }) => {
    const [coinA, coinB] = typeStr.replace('>', '').split('<')[1].split(', ')
    api.add(coinA, fields.balance_x)
    api.add(coinB, fields.balance_y)
  })
}

module.exports = {
  sui: { tvl }
}