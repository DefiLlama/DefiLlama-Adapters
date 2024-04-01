const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

const decimalShift = {
  [ADDRESSES.sui.USDC]: -3, // USDC
  [ADDRESSES.sui.USDT]: -3, // USDT
  [ADDRESSES.sui.WETH]: -1,  // WETH
}

const storageId = "0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe"

async function borrow(api) {
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

  const dynamicFields = await sui.getDynamicFieldObjects({parent: reservesId})
  dynamicFields.forEach((data) => {
    const coin = '0x' + data.fields.value.fields.coin_type
    const borrowed = data.fields.value.fields.borrow_balance.fields.total_supply
    const amount = borrowed * (10 ** (decimalShift[coin] ?? 0))
    api.add(coin, amount)
  })
}


async function tvl(api) {
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

   const dynamicFields = await sui.getDynamicFieldObjects({parent: reservesId})
  dynamicFields.forEach(object => {
    const coin = '0x' + object.fields.value.fields.coin_type
    const total_supply = object.fields.value.fields.supply_balance.fields.total_supply
    const borrowed = object.fields.value.fields.borrow_balance.fields.total_supply
    const amount = (total_supply - borrowed) * (10 ** (decimalShift[coin] ?? 0))
    api.add(coin, amount)
  })
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed: borrow,
  },
}