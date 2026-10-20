const { test } = require('node:test')
const assert = require('node:assert/strict')
const { addPricedBalances } = require('./pricing')

const mint = 'dawn7ZUF7h7anFuEsDdAU1Y3HYwikwqNMAENZsQJdNL'
const quote = () => ({ mint, usdPrice: 0.98, timestamp: Math.floor(Date.now() / 1000) })
const api = () => ({
  usd: 0,
  tokens: {},
  addUSDValue(value) { this.usd += value },
  addTokens(mints, amounts) { mints.forEach((m, i) => { this.tokens[m] = amounts[i] }) },
})

test('prices USD.infra once at the oracle price and preserves other balances', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: true, json: async () => quote() }))
  const result = api()
  await addPricedBalances(result, { [mint]: 2500000n, other: 123n })
  assert.equal(result.usd, 2.45)
  assert.deepEqual(result.tokens, { other: 123n })
})

test('does not require the oracle when there is no USD.infra exposure', async t => {
  const fetch = t.mock.method(global, 'fetch', async () => { throw new Error('unexpected fetch') })
  for (const balances of [{ other: 123n }, { [mint]: 0n, other: 123n }]) {
    const result = api()
    await addPricedBalances(result, balances)
    assert.equal(result.usd, 0)
    assert.deepEqual(result.tokens, { other: 123n })
  }
  assert.equal(fetch.mock.callCount(), 0)
})

test('fails rather than publishing a partial total for unusable oracle quotes', async t => {
  for (const invalid of [
    { usdPrice: 0 }, { usdPrice: -1 }, { usdPrice: NaN }, { usdPrice: Infinity },
    { usdPrice: '1' }, { timestamp: undefined }, { mint: 'wrong-mint' },
    { timestamp: Math.floor(Date.now() / 1000) - 601 },
    { timestamp: Math.floor(Date.now() / 1000) + 120 },
  ]) {
    const fetch = t.mock.method(global, 'fetch', async () => ({
      ok: true, json: async () => ({ ...quote(), ...invalid }),
    }))
    const result = api()
    await assert.rejects(addPricedBalances(result, { [mint]: 1000000n, other: 123n }))
    assert.equal(result.usd, 0)
    assert.deepEqual(result.tokens, {})
    fetch.mock.restore()
  }
})

test('propagates HTTP failures', async t => {
  t.mock.method(global, 'fetch', async () => ({ ok: false, status: 503 }))
  await assert.rejects(addPricedBalances(api(), { [mint]: 1000000n }), /HTTP 503/)
})
