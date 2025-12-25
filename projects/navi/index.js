const sui = require("../helper/chain/sui")
const { fetchURL } = require('../helper/utils')

function getDecimalShifts(dynamicFields){
  return fetchURL(`https://coins.llama.fi/prices/current/${dynamicFields.map(c=>`sui:0x${c.fields.value.fields.coin_type}`).join(',')}`).then(r=>r.data.coins)
}

const storageId = "0xbb4e2f4b6205c2e2a2db47aeb4f830796ec7c005f88537ee775986639bc442fe"

const blacklistedCoins = [
  '0xd1a91b46bd6d966b62686263609074ad16cfdffc63c31a4775870a2d54d20c6b::mbtc::MBTC',
  '0x8f2b5eb696ed88b71fea398d330bccfa52f6e2a5a8e1ac6180fcb25c6de42ebc::coin::COIN',
  '0xa03ab7eee2c8e97111977b77374eaf6324ba617e7027382228350db08469189e::ybtc::YBTC',
]

async function borrow(api) {
  const storageObject = await sui.getObject(storageId);
  const reservesId = storageObject.fields.reserves.fields.id.id

  const dynamicFields = await sui.getDynamicFieldObjects({ parent: reservesId })
  const decimals = await getDecimalShifts(dynamicFields)

  dynamicFields.forEach((data) => {
    const coin = '0x' + data.fields.value.fields.coin_type
    const borrowed = data.fields.value.fields.borrow_balance.fields.total_supply * data.fields.value.fields.current_borrow_index / 1e27
    if(decimals["sui:"+coin] && !blacklistedCoins.includes(coin)){
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
    if(decimals["sui:"+coin] && !blacklistedCoins.includes(coin)){
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