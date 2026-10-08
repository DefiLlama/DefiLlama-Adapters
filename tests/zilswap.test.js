const assert = require('node:assert/strict')
const { test, beforeEach, afterEach, mock } = require('node:test')
const axios = require('axios')
const { util: { sumSingleBalance } } = require('@defillama/sdk')
const adapter = require('../projects/zilswap')

const CONTRACT = '459cb2d3baf7e61cfbd5fe362f289ae92b2babb0'

beforeEach(() => {
  mock.method(axios, 'get', async () => {
    throw new Error('Legacy stats API unavailable')
  })
})
afterEach(() => mock.restoreAll())

function pool(zilReserve, tokenReserve) {
  return { constructor: `0x${CONTRACT}.Pool`, argtypes: [], arguments: [zilReserve, tokenReserve] }
}

function rpcResponse(response) {
  mock.method(axios, 'post', async (url, query) => {
    assert.equal(url, 'https://api.zilliqa.com/')
    assert.equal(query.jsonrpc, '2.0')
    assert.equal(query.method, 'GetSmartContractSubState')
    assert.deepEqual(query.params, [CONTRACT, 'pools', []])
    return { data: response }
  })
}

function poolsResponse(pools) {
  rpcResponse({ jsonrpc: '2.0', id: `pools-${CONTRACT}`, result: { pools } })
}

test('values both sides of every pool from reserves, without the stats API or LP supply', async () => {
  poolsResponse({
    tokenA: pool('1000000000000', '9000000000000000000'),
    tokenB: pool('2500000000000', '5000000'),
  })
  assert.deepEqual(await adapter.zilliqa.tvl(), { 'coingecko:zilliqa': 7 })
})

test('preserves reserves above Number.MAX_SAFE_INTEGER and fractional ZIL', async () => {
  poolsResponse({ tokenA: pool('9007199254740993', '100'), tokenB: pool('1', '1') })
  assert.deepEqual(await adapter.zilliqa.tvl(), { 'coingecko:zilliqa': 18014.398509481988 })
})

test('returns fractional CoinGecko balances accepted by the SDK and TVL harness', async () => {
  poolsResponse({ tokenA: pool('1500000000001', '100') })
  const balances = await adapter.zilliqa.tvl()
  const normalized = {}
  sumSingleBalance(normalized, 'coingecko:zilliqa', balances['coingecko:zilliqa'])
  assert.equal(Number(normalized['coingecko:zilliqa']), 3.000000000002)
})

test('returns zero for an empty pool map', async () => {
  poolsResponse({})
  assert.deepEqual(await adapter.zilliqa.tvl(), { 'coingecko:zilliqa': 0 })
})

test('accepts an empty pool alongside funded pools', async () => {
  poolsResponse({ empty: pool('0', '0'), funded: pool('1', '1') })
  assert.deepEqual(await adapter.zilliqa.tvl(), { 'coingecko:zilliqa': 0.000000000002 })
})

test('fails on a JSON-RPC error instead of publishing zero TVL', async () => {
  rpcResponse({ jsonrpc: '2.0', id: 1, error: { code: -5, message: 'Contract unavailable' } })
  await assert.rejects(adapter.zilliqa.tvl(), /Contract unavailable/)
})

test('propagates transport failures', async () => {
  mock.method(axios, 'post', async () => { throw new Error('RPC unavailable') })
  await assert.rejects(adapter.zilliqa.tvl(), /Failed to post/)
})

for (const [name, response] of [
  ['missing result', {}],
  ['missing pools', { result: {} }],
  ['null pools', { result: { pools: null } }],
  ['array pools', { result: { pools: [] } }],
]) {
  test(`rejects ${name}`, async () => {
    rpcResponse(response)
    await assert.rejects(adapter.zilliqa.tvl(), /Invalid ZilSwap pools/)
  })
}

for (const [name, value] of [
  ['missing reserves', {}],
  ['wrong reserve count', { arguments: ['1'] }],
  ['negative reserve', pool('-1', '1')],
  ['fractional reserve', pool('1.5', '1')],
  ['numeric reserve', pool(9007199254740992, '1')],
  ['invalid token reserve', pool('1', 'invalid')],
  ['zero token reserve with positive ZIL', pool('1', '0')],
  ['zero ZIL reserve with positive tokens', pool('0', '1')],
]) {
  test(`rejects ${name} without returning a partial total`, async () => {
    poolsResponse({ funded: pool('1000000000000', '100'), malformed: value })
    await assert.rejects(adapter.zilliqa.tvl(), /Invalid ZilSwap pool/)
  })
}
