const { getObject, getDynamicFieldObjects } = require('../helper/chain/sui')

const WAD = 10n ** 18n

const MARKET_OBJECT_IDS = [
  '0x41f3d76aee8b20e53f7d0d395fdc09e241e683c7bc5d0f69674b545ee42549df', // MainMarket
  '0x6f5230c346e27132b8d4d92cb3f4f9c7f4e736d5c32b8f0a2b063c97e67d78f7', // AltCoinMarket
  '0x8e85c433f791685c65fa66923110b8385e13f955daf8792ef805ce2d47139bbc', // EmberMarket
  '0xafe28c816d322a56bdab27b90d4b5e882a0a34ee2d9f02c6a07402a2b69be900', // MatrixGoldMarket
  '0xeeef7e9abe201e16c3ca6417b91fa49bec28edcb077eb2fd4a1f126c251e6899', // EthenaMarket
]

function coinTypeFromName(name) {
  return name.startsWith('0x') ? name : `0x${name}`
}

let _reserveRowsPromise

async function getReserveRows() {
  if (!_reserveRowsPromise) _reserveRowsPromise = (async () => {
    const rows = []
    for (const marketId of MARKET_OBJECT_IDS) {
      const market = await getObject(marketId)
      const tableId = market.fields.reserves.fields.table.fields.table.fields.id.id
      const objects = await getDynamicFieldObjects({ parent: tableId })
      for (const obj of objects) {
        rows.push({
          coinType: coinTypeFromName(obj.fields.name.fields.name),
          reserve: obj.fields.value.fields,
        })
      }
    }
    return rows
  })()
  return _reserveRowsPromise
}

async function tvl(api) {
  for (const { coinType, reserve } of await getReserveRows()) {
    api.add(coinType, reserve.cash)
  }
}

async function borrowed(api) {
  for (const { coinType, reserve } of await getReserveRows()) {
    api.add(coinType, BigInt(reserve.debt.fields.value) / WAD)
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts on-chain underlying liquidity: for each configured Sui market object, we enumerate reserve entries in the market’s reserve table and sum Reserve.cash per asset. Borrowed counts total outstanding borrows per asset as Reserve.debt.',
  sui: { tvl, borrowed },
}
