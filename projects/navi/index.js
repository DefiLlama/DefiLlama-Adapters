const sui = require("../helper/chain/sui")

const reserves = [
  "0xab644b5fd11aa11e930d1c7bc903ef609a9feaf9ffe1b23532ad8441854fbfaf",
  "0xeb3903f7748ace73429bd52a70fff278aac1725d3b58afa781f25ce3450ac203",
]

const decimalShift = {
  '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN': -3, // USDC
}


async function borrow() {
  const { api } = arguments[3]
  const objects = await sui.getObjects(reserves)
  objects.forEach(object => {
    const coin = '0x' + object.fields.value.fields.coin_type
    const borrowed = object.fields.value.fields.borrow_balance.fields.total_supply
    const amount = borrowed * (10 ** (decimalShift[coin] ?? 0))
    api.add(coin, amount)
  })
}


async function tvl() {
  const { api } = arguments[3]
  const objects = await sui.getObjects(reserves)
  objects.forEach(object => {
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