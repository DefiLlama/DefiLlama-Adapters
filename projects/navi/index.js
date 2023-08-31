const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui")

const reserves = [
  "0xab644b5fd11aa11e930d1c7bc903ef609a9feaf9ffe1b23532ad8441854fbfaf", // Reserve For SUI
  "0xeb3903f7748ace73429bd52a70fff278aac1725d3b58afa781f25ce3450ac203", // Reserve For USDC
  "0xb8c5eab02a0202f638958cc79a69a2d30055565caad1684b3c8bbca3bddcb322", // Reserve For USDT
  "0xafecf4b57899d377cc8c9de75854c68925d9f512d0c47150ca52a0d3a442b735"  // Reserve For WETH
]

const decimalShift = {
  [ADDRESSES.sui.USDC]: -3, // USDC
  [ADDRESSES.sui.USDT]: -3, // USDT
  [ADDRESSES.sui.WETH]: -1  // WETH
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