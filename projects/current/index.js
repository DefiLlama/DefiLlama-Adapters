const { getObjectsByType, getDynamicFieldObjects } = require('../helper/chain/sui')

const WAD = 10n ** 18n

// every lending market is a Market<MarketType> object of the protocol package (MainMarket, AltCoinMarket, EmberMarket,
// MatrixGoldMarket, EthenaMarket, Market01 = sUSN Market, ...), and only the AdminCap holder can register one
// (market_admin::register_market), so markets are discovered by type
const MARKET_TYPE = '0xfe1d8929d13b00aaecd7642dec1c6d41cab82882a1b139efa46bf61dfd6380bf::market::Market'

function coinTypeFromName(name) {
  return name.startsWith('0x') ? name : `0x${name}`
}

let _reserveRowsPromise

async function getReserveRows() {
  if (!_reserveRowsPromise) _reserveRowsPromise = (async () => {
    const rows = []
    const markets = await getObjectsByType(MARKET_TYPE)
    if (!markets.length) throw new Error('current: no markets found')
    for (const market of markets) {
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
  })().catch(e => { _reserveRowsPromise = undefined; throw e })
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
  methodology: 'TVL counts on-chain underlying liquidity: for each Sui market object (all Market<T> objects of the protocol package), we enumerate reserve entries in the market’s reserve table and sum Reserve.cash per asset. Borrowed counts total outstanding borrows per asset as Reserve.debt.',
  sui: { tvl, borrowed },
}
