const sui = require('../helper/chain/sui')
const { normalizeCoinType } = require('@defillama/sdk').chains.sui

// Mainnet defining types, verified on the live Jitter Points book and its creation event.
const ORDERBOOK = '0x15e9e1df6c5c67e16244069eb4b2feb10f16ae7d3f06fc51b8b51e1dc70a6f37::orderbook::OrderBook'
const JITTER_POINT = '0xabf187fe86408e5eb89001d44947dbb55ee727a9da340631a15a7611bec28b78::jitter_point::JITTER_POINT'

function unsigned(value) {
  if ((typeof value !== 'string' && typeof value !== 'number') ||
      (typeof value === 'number' && !Number.isSafeInteger(value)) || !/^\d+$/.test(String(value))) throw new Error('Invalid Jitter point escrow counter')
  return BigInt(value)
}

async function addPointEscrow(api) {
  const books = await sui.getObjectsByType(ORDERBOOK)
  for (const book of books) {
    const [base, quote] = sui.parseStructTag(book.type).typeParams
    if (normalizeCoinType(base) !== normalizeCoinType(JITTER_POINT)) continue
    if (!quote || normalizeCoinType(quote) === normalizeCoinType(base)) throw new Error('Invalid Jitter point quote asset')
    const bids = book.fields.bids.fields
    const slices = await sui.getDynamicFieldObjects({ parent: bids.levels.fields.id.id })
    let balance = 0n, levelCount = 0n, orderCount = 0n
    const seen = new Set()
    for (const field of slices) {
      const slice = field.fields.value
      if (!slice?.type?.includes('::keyed_big_vector::Slice<')) continue // key-to-index metadata has no funds
      for (const element of slice.fields.vector) {
        levelCount++
        const table = element.fields.value.fields.orders.fields
        const entries = await sui.getDynamicFieldObjects({ parent: table.id.id })
        if (BigInt(entries.length) !== unsigned(table.size)) throw new Error('Incomplete Jitter point order table')
        for (const entry of entries) {
          const order = entry.fields.value.fields.value.fields
          const id = String(order.id)
          if (seen.has(id)) throw new Error('Duplicate Jitter point order')
          seen.add(id)
          // Unspent maker fee reserves still belong to the user. Accrued protocol
          // coin_quote_fee_vault is intentionally NOT counted, nor are own points on asks.
          balance += unsigned(order.input) + unsigned(order.maker_fee_reserve)
          orderCount++
        }
      }
    }
    if (levelCount !== unsigned(bids.levels.fields.length) || orderCount !== unsigned(bids.order_count)) throw new Error('Incomplete Jitter point orderbook')
    api.add(quote, balance.toString())
  }
}

module.exports = { addPointEscrow }
