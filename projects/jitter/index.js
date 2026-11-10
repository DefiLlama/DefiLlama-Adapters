const sui = require('../helper/chain/sui')
const { normalizeCoinType } = require('@defillama/sdk').chains.sui

// Original type IDs survive package upgrades; discover all live market vaults.
const SCALLOP_VAULT = '0xe77999674332f5bd078c8d7182002f7bbf7844591f4d36dbfd1182b25ae071c0::scallop_market_vault::ScallopMarketVault'
const HAEDAL_VAULT = '0x4e4f6a5ee9504840a1bd5a9db589782fa44d6d1ce6f4fe45e93c6b664e161ca3::haedal_market_vault::HaedalMarketVault'
const EMBER_VAULT = '0xc56a55893f4791d03726f9c109725765b584c06eb5625704ce782112d763ef99::ember_market_vault::EmberMarketVault'
const HASUI = '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI'
const ORDERBOOK = '0x15e9e1df6c5c67e16244069eb4b2feb10f16ae7d3f06fc51b8b51e1dc70a6f37::orderbook::OrderBook'
const JITTER_POINT = '0xabf187fe86408e5eb89001d44947dbb55ee727a9da340631a15a7611bec28b78::jitter_point::JITTER_POINT'

// Quote coins escrowed in Jitter Points bids (input + unspent maker fee reserve), asks hold own points and the fee vault is protocol revenue
async function addPointEscrow(api) {
  const books = await sui.getObjectsByType(ORDERBOOK)
  for (const { type, fields } of books) {
    const [base, quote] = sui.parseStructTag(type).typeParams
    if (normalizeCoinType(base) !== normalizeCoinType(JITTER_POINT)) continue
    const bids = fields.bids.fields
    const slices = await sui.getDynamicFieldObjects({ parent: bids.levels.fields.id.id })
    let balance = 0n, levelCount = 0, orderCount = 0
    for (const { fields: { value: slice } } of slices) {
      if (!slice?.type?.includes('::keyed_big_vector::Slice<')) continue // key-to-index table holds no funds
      for (const { fields: { value: level } } of slice.fields.vector) {
        levelCount++
        const table = level.fields.orders.fields
        const orders = await sui.getDynamicFieldObjects({ parent: table.id.id })
        if (orders.length !== +table.size) throw new Error('Incomplete Jitter point order table')
        for (const order of orders) {
          const { input, maker_fee_reserve } = order.fields.value.fields.value.fields
          balance += BigInt(input) + BigInt(maker_fee_reserve)
          orderCount++
        }
      }
    }
    if (levelCount !== +bids.levels.fields.length || orderCount !== +bids.order_count) throw new Error('Incomplete Jitter point orderbook')
    api.add(quote, balance.toString())
  }
}

async function tvl(api) {
  const scallopVaults = await sui.getObjectsByType(SCALLOP_VAULT)
  const haedalVaults = await sui.getObjectsByType(HAEDAL_VAULT)
  const emberVaults = await sui.getObjectsByType(EMBER_VAULT)
  const markets = new Map()
  const sheets = new Map()

  for (const { type, fields } of scallopVaults) {
    const balance = BigInt(fields.market_coin_balance)
    if (balance === 0n) continue
    const [underlying] = sui.parseStructTag(type).typeParams
    const marketId = fields.scallop_market_id
    if (!markets.has(marketId)) markets.set(marketId, await sui.getObject(marketId))
    const tableId = markets.get(marketId).fields.vault.fields.balance_sheets.fields.table.fields.id.id
    const coinName = normalizeCoinType(underlying).slice(2)
    const key = `${tableId}:${coinName}`
    if (!sheets.has(key)) {
      const sheet = await sui.getDynamicFieldObject(tableId, coinName, { idType: '0x1::type_name::TypeName' })
      if (!sheet) throw new Error(`Missing Scallop balance sheet: ${underlying}`)
      sheets.set(key, sheet.fields.value.fields)
    }
    const sheet = sheets.get(key)
    const netAssets = BigInt(sheet.cash) + BigInt(sheet.debt) - BigInt(sheet.revenue)
    const supply = BigInt(sheet.market_coin_supply)
    if (netAssets < 0n || supply <= 0n) throw new Error(`Invalid Scallop balance sheet: ${underlying}`)
    api.add(underlying, (balance * netAssets / supply).toString())
  }

  // Queued withdrawals remain in these balances until paid; do not add the queue again.
  for (const { fields } of haedalVaults) api.add(HASUI, fields.receipt_balance)
  for (const { type, fields } of emberVaults) {
    const [, receipt] = sui.parseStructTag(type).typeParams
    api.add(receipt, fields.receipt_balance)
  }
  await addPointEscrow(api)
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'Counts receipt assets in Jitter market vaults, including pending withdrawals until paid, plus quote coins locked in Jitter Points bids and their unspent maker-fee reserves. Scallop shares use on-chain (cash + debt - revenue) / market_coin_supply; Haedal and Ember receipts are priced as their own tokens. Own Jitter Points on asks, accrued point-trading protocol fees, and separate SY/PT/YT/LP or treasury balances are excluded. Yield backing overlaps with Scallop, Haedal and Ember TVL.',
  sui: { tvl },
}
