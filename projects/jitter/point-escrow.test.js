const { test } = require('node:test')
const assert = require('node:assert/strict')
const sui = require('../helper/chain/sui')
const { addPointEscrow } = require('./point-escrow')
const base = '0xabf187fe86408e5eb89001d44947dbb55ee727a9da340631a15a7611bec28b78::jitter_point::JITTER_POINT'
const quote = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'

async function run({ wrongCount = false, input = '2500000', reserve = '1234' } = {}) {
  const oldTypes = sui.getObjectsByType, oldFields = sui.getDynamicFieldObjects
  sui.getObjectsByType = async () => [{ type: `0x15e9e1df6c5c67e16244069eb4b2feb10f16ae7d3f06fc51b8b51e1dc70a6f37::orderbook::OrderBook<${base}, ${quote}>`,
    fields: { coin_quote_fee_vault: '99999999', asks: 'own points must not be read', bids: { fields: {
      levels: { fields: { id: { id: 'levels' }, length: '1' } }, order_count: wrongCount ? '2' : '1',
    } } } }]
  sui.getDynamicFieldObjects = async ({ parent }) => parent === 'levels' ? [{ fields: { value: {
    type: '0x1::keyed_big_vector::Slice<u128, PriceLevel>', fields: { vector: [{ fields: { value: { fields: {
      orders: { fields: { id: { id: 'orders' }, size: '1' } },
    } } } }] },
  } } }] : [{ fields: { value: { fields: { value: { fields: { id: '12', input, maker_fee_reserve: reserve } } } } } }]
  const output = []
  try { await addPointEscrow({ add: (token, balance) => output.push([token, balance]) }); return output }
  finally { sui.getObjectsByType = oldTypes; sui.getDynamicFieldObjects = oldFields }
}

test('quote collateral and unused maker fees count; own points and accrued fees do not', async () => {
  assert.deepEqual(await run(), [[quote, '2501234']])
})
test('partial order reads fail instead of reporting a healthy lower TVL', async () => {
  await assert.rejects(run({ wrongCount: true }), /Incomplete/)
})
test('negative or malformed escrow balances are rejected', async () => {
  await assert.rejects(run({ input: '-1' }), /Invalid/)
  await assert.rejects(run({ reserve: 'NaN' }), /Invalid/)
})
