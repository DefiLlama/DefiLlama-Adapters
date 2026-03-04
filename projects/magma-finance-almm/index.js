const sui = require('../helper/chain/sui')

async function processPool(poolObjectID, api) {
  const { fields: { pairs: { fields: listObject } } } = await sui.getObject(poolObjectID)
  const items = (await sui.getDynamicFieldObjects({ parent: listObject.id.id })).map(i => i.fields.value)
  const poolInfo = await sui.getObjects(items)
  
  poolInfo.forEach(({ type: typeStr, fields }) => {
    const [coinA, coinB] = typeStr.replace('>', '').split('<')[1].split(', ')
    api.add(coinA, fields.reserve_x)
    api.add(coinB, fields.reserve_y)
  })
}

async function suiTVL(api) {
  const poolObjectIDs = [
    '0xedb456e93e423dd75a8ddebedd9974bb661195043027e32ce01649d6ccee74cf',
    '0x29999aadee09eb031cc98a73b605805306d6ae0fe9d5099fb9e6628d99527234'
  ]
  
  await Promise.all(poolObjectIDs.map(poolID => processPool(poolID, api)))
}

module.exports = {
  sui: {
    tvl: suiTVL,
  }
}
