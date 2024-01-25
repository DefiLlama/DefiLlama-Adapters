const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

const decimalShift = {
  [ADDRESSES.sui.USDC]: -3, // USDC
  [ADDRESSES.sui.USDT]: -3, // USDT
  [ADDRESSES.sui.WETH]: -1,  // WETH
}

const storageId = "0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe"

async function borrow() {
  const { api } = arguments[3]
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

  const dynamicFields = await sui.getDynamicFieldObjects({ parent: reservesId })
  dynamicFields.forEach((data) => {
    const coin = '0x' + data.fields.value.fields.coin_type
    const borrowed = data.fields.value.fields.borrow_balance.fields.total_supply
    const amount = borrowed * (10 ** (decimalShift[coin] ?? 0))
    api.add(coin, amount)
  })
}


async function tvl() {
  const { api } = arguments[3]
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

  const dynamicFields = await sui.getDynamicFieldObjects({ parent: reservesId })
  const voloSuiTvl = await voloTvl()
  console.log(voloSuiTvl)

  dynamicFields.forEach(object => {
    const coin = '0x' + object.fields.value.fields.coin_type
    const total_supply = object.fields.value.fields.supply_balance.fields.total_supply
    const borrowed = object.fields.value.fields.borrow_balance.fields.total_supply
    var amount = (total_supply - borrowed) * (10 ** (decimalShift[coin] ?? 0))
    if (coin === "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT") {
      console.log(amount)
      amount = amount + voloSuiTvl
    }
    api.add(coin, amount)
  })
}

async function voloTvl() {
  const nativePoolObj = await sui.getObject('0x7fa2faa111b8c65bea48a23049bfd81ca8f971a262d981dcd9a17c3825cb5baf');

  const totalStakedValue = +(await sui.getDynamicFieldObject(
    nativePoolObj.fields.total_staked.fields.id.id,
    nativePoolObj.fields.staked_update_epoch,
    {
      idType: 'u64'
    })).fields.value + +nativePoolObj.fields.pending.fields.balance;

  const totalPendingRewards = +nativePoolObj.fields.total_rewards - nativePoolObj.fields.collected_rewards;
  const unstakeTicketsSupply = +nativePoolObj.fields.ticket_metadata.fields.total_supply;

  const totalStakedSui = totalStakedValue + totalPendingRewards - unstakeTicketsSupply;

  return totalStakedSui
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed: borrow,
  },
}