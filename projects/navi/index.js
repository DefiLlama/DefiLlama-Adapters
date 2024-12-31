const sui = require("../helper/chain/sui")
const { fetchURL } = require('../helper/utils')

function getDecimalShifts(dynamicFields){
  return fetchURL(`https://coins.llama.fi/prices/current/${dynamicFields.map(c=>`sui:0x${c.fields.value.fields.coin_type}`).join(',')}`).then(r=>r.data.coins)
}

const storageId = "0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe"

async function borrow(api) {
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

  const dynamicFields = await sui.getDynamicFieldObjects({ parent: reservesId })
  const decimals = await getDecimalShifts(dynamicFields)

  dynamicFields.forEach((data) => {
    const coin = '0x' + data.fields.value.fields.coin_type
    const borrowed = data.fields.value.fields.borrow_balance.fields.total_supply * data.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin]){
      const amount = borrowed * (10 ** (decimals["sui:"+coin].decimals - 9))
      api.add(coin, amount)
    }
  })
}


async function tvl(api) {
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

  const dynamicFields = await sui.getDynamicFieldObjects({ parent: reservesId })
  const decimals = await getDecimalShifts(dynamicFields)

  dynamicFields.forEach(object => {
    const coin = '0x' + object.fields.value.fields.coin_type
    const total_supply = object.fields.value.fields.supply_balance.fields.total_supply * object.fields.value.fields.current_supply_index / 1e27
    const borrowed = object.fields.value.fields.borrow_balance.fields.total_supply * object.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin]){
      const amount = (total_supply - borrowed) * (10 ** (decimals["sui:"+coin].decimals - 9))
      api.add(coin, amount)
    }
  })
}


module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed: borrow,
  },
}