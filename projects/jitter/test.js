const assert = require('node:assert/strict')
const { test, beforeEach, after } = require('node:test')
const sui = require('../helper/chain/sui')
const { normalizeCoinType } = require('@defillama/sdk').chains.sui
const adapter = require('./index')

const SUI = '0x2::sui::SUI'
const USDC = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
const HASUI = '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI'
const originals = Object.fromEntries(['getObjectsByType', 'getObject', 'getDynamicFieldObject'].map(key => [key, sui[key]]))
let vaults, sheet, calls

beforeEach(() => {
  vaults = { scallop: [], haedal: [], ember: [] }
  sheet = { cash: '900', debt: '300', revenue: '100', market_coin_supply: '1000' }
  calls = { markets: 0, sheets: [] }
  sui.getObjectsByType = async type => vaults[type.includes('Scallop') ? 'scallop' : type.includes('Haedal') ? 'haedal' : 'ember']
  sui.getObject = async () => {
    calls.markets++
    return { fields: { vault: { fields: { balance_sheets: { fields: { table: { fields: { id: { id: 'table' } } } } } } } } }
  }
  sui.getDynamicFieldObject = async (...args) => {
    calls.sheets.push(args)
    return sheet && { fields: { value: { fields: sheet } } }
  }
})
after(() => Object.assign(sui, originals))

function scallop(underlying, balance, fields = {}) {
  return { type: `0x1::vault::Vault<${underlying}, 0x1::sy::SY, 0x1::pt::PT, 0x1::yt::YT>`, fields: { market_coin_balance: balance, scallop_market_id: 'market', ...fields } }
}

async function balances() {
  const result = {}
  await adapter.sui.tvl({ add: (token, amount) => {
    result[token] = ((BigInt(result[token] || '0')) + BigInt(amount)).toString()
  } })
  return result
}

test('counts actual custody once, not SY supply, pool balances or withdrawal queue', async () => {
  vaults.scallop = [scallop(SUI, '1000', { queued_market_coin: '400', total_sy: '999999', paused: true })]
  assert.deepEqual(await balances(), { [SUI]: '1100' })
})

test('6 and 9 decimal assets retain raw units, without using SY metadata decimals', async () => {
  vaults.scallop = [scallop(SUI, '1000000000'), scallop(USDC, '1000000')]
  assert.deepEqual(await balances(), { [SUI]: '1100000000', [USDC]: '1100000' })
})

test('keeps u64 precision above the JS safe-integer range and rounds down', async () => {
  const amount = 18446744073709551615n
  sheet = { cash: '10000000000000000000', debt: '3000000000000000000', revenue: '1000000000000000000', market_coin_supply: '11000000000000000000' }
  vaults.scallop = [scallop(SUI, amount.toString())]
  assert.deepEqual(await balances(), { [SUI]: (amount * 12000000000000000000n / 11000000000000000000n).toString() })
})

test('normalizes TypeName keys and caches shared upstream reads within one run', async () => {
  vaults.scallop = [scallop(SUI, '1000'), scallop(normalizeCoinType(SUI), '1000')]
  await balances()
  assert.equal(calls.markets, 1)
  assert.deepEqual(calls.sheets, [['table', normalizeCoinType(SUI).slice(2), { idType: '0x1::type_name::TypeName' }]])
  await balances()
  assert.equal(calls.markets, 2, 'must refresh balances on the next TVL run')
})

test('does not require a positive receipt supply for an empty Jitter vault', async () => {
  vaults.scallop = [scallop(SUI, '0')]
  sheet.market_coin_supply = '0'
  assert.deepEqual(await balances(), {})
  assert.equal(calls.markets, 0)
})

test('counts Haedal and Ember receipt balances without also adding queued claims', async () => {
  const receipt = '0x3::receipt::RECEIPT<0x2::sui::SUI>'
  vaults.haedal = [{ fields: { receipt_balance: '1000000001', queued_receipt: '500000000' } }]
  vaults.ember = [{ type: `0x1::vault::Vault<${USDC}, ${receipt}, 0x1::sy::SY, 0x1::pt::PT, 0x1::yt::YT>`, fields: { receipt_balance: '9007199254740993', queued_receipt: '100' } }]
  assert.deepEqual(await balances(), { [HASUI]: '1000000001', [receipt]: '9007199254740993' })
})

test('fails rather than silently omitting a missing Scallop balance sheet', async () => {
  vaults.scallop = [scallop(SUI, '1')]
  sheet = null
  await assert.rejects(balances(), /Missing Scallop balance sheet/)
})

test('fails on invalid backing or receipt supply instead of reporting fake TVL', async () => {
  vaults.scallop = [scallop(SUI, '1')]
  sheet.market_coin_supply = '0'
  await assert.rejects(balances(), /Invalid Scallop balance sheet/)
  sheet.market_coin_supply = '1000'
  sheet.revenue = '1201'
  await assert.rejects(balances(), /Invalid Scallop balance sheet/)
})

test('propagates GraphQL discovery errors instead of reporting an empty protocol', async () => {
  sui.getObjectsByType = async () => { throw new Error('GraphQL unavailable') }
  await assert.rejects(balances(), /GraphQL unavailable/)
})

test('declares current-state-only reads and the overlap with upstream protocols', () => {
  assert.equal(adapter.timetravel, false)
  assert.equal(adapter.doublecounted, true)
  assert.deepEqual(Object.keys(adapter.sui), ['tvl'])
})
