const assert = require('node:assert/strict')
const { test } = require('node:test')
const sdk = require('@defillama/sdk')
const starknet = require('../projects/helper/chain/starknet')
const cache = require('../projects/helper/cache')
const rpc = require('@defillama/sdk/build/chains/rpc')

const CURRENT = '0x01aa950c9b974294787de8df8880ecf668840a6ab8fa8290bf2952212b375148'
const LEGACY = '0x04ba0de31008f4e3edd42b3c31db8f49490505885d684b78f5aa1572850b3a5a'
const TOPIC = '0x27dd458d081c22bd6e76f4dddbc87f11e477b7c5823b13f147d45f91ec098ee'
const address = starknet.parseAddress

function event(pool, token0 = '0x11', token1 = '0x22') {
  return {
    block_number: 638371,
    block_hash: '0x123',
    transaction_hash: '0x456',
    from_address: CURRENT,
    keys: [TOPIC],
    data: [token0, token1, '0x64', '0x2', pool],
  }
}

function setup(t, logs = { [CURRENT]: [event('0x33')], [LEGACY]: [] }) {
  t.mock.method(starknet, 'getLogs', async ({ target, fromBlock, topics }) => {
    assert.deepEqual(topics, [TOPIC])
    assert.equal(fromBlock, target === CURRENT ? 637881 : 535428)
    return logs[target]
  })
  // A working cache must not conceal a failed or incomplete event scan.
  t.mock.method(cache, 'cachedGraphQuery', async () => ({ pools: [
    { poolAddress: '0x33', token0: { tokenAddress: '0x11' }, token1: { tokenAddress: '0x22' } },
  ] }))
  delete require.cache[require.resolve('../projects/jediswap-v2')]
  return { adapter: require('../projects/jediswap-v2'), api: new sdk.ChainApi({ chain: 'starknet' }) }
}

function mockBalances(t, balance = '10') {
  t.mock.method(sdk.chains.starknet, 'multiCall', async ({ calls }) => calls.map(() => balance))
}

test('counts both tokens in current and deprecated pools, including pools absent from the graph cache', async t => {
  const { adapter, api } = setup(t, { [CURRENT]: [event('0x33'), event('0x44')], [LEGACY]: [event('0x55')] })
  mockBalances(t)
  await adapter.starknet.tvl(api)
  assert.deepEqual(api.getBalances(), { [`starknet:${address('0x11')}`]: '30', [`starknet:${address('0x22')}`]: '30' })
})

test('normalizes addresses and counts repeated pool events only once', async t => {
  const { adapter, api } = setup(t, { [CURRENT]: [event('0x33'), event('0x0033', '0x0011', '0x0022')], [LEGACY]: [] })
  mockBalances(t)
  await adapter.starknet.tvl(api)
  assert.deepEqual(api.getBalances(), { [`starknet:${address('0x11')}`]: '10', [`starknet:${address('0x22')}`]: '10' })
})

test('does not truncate pool discovery at the former 1000-pool graph limit', async t => {
  const logs = Array.from({ length: 1001 }, (_, i) => event(`0x${(i + 100).toString(16)}`))
  const { adapter, api } = setup(t, { [CURRENT]: logs, [LEGACY]: [] })
  mockBalances(t, '1')
  await adapter.starknet.tvl(api)
  assert.equal(api.getBalances()[`starknet:${address('0x11')}`], '1001')
})

test('propagates discovery failures instead of using a stale graph cache', async t => {
  const { adapter, api } = setup(t)
  t.mock.method(starknet, 'getLogs', async () => { throw new Error('event RPC unavailable') })
  // Reload because the adapter may destructure its helper imports.
  delete require.cache[require.resolve('../projects/jediswap-v2')]
  mockBalances(t)
  await assert.rejects(require('../projects/jediswap-v2').starknet.tvl(api), /event RPC unavailable/)
})

test('propagates balance failures instead of returning a partial TVL', async t => {
  const { adapter, api } = setup(t)
  t.mock.method(sdk.chains.starknet, 'multiCall', async () => { throw new Error('balance RPC unavailable') })
  await assert.rejects(adapter.starknet.tvl(api), /balance RPC unavailable/)
})

test('rejects malformed pool events before reading balances', async t => {
  const malformed = { ...event('0x33'), data: ['0x11'] }
  const { adapter, api } = setup(t, { [CURRENT]: [malformed], [LEGACY]: [] })
  mockBalances(t)
  await assert.rejects(adapter.starknet.tvl(api))
  assert.deepEqual(api.getBalances(), {})
})

test('preserves both uint256 limbs through the real SDK decoder and balance accumulator', async t => {
  const { adapter, api } = setup(t)
  t.mock.method(rpc, 'jsonRpcBatch', async () => { throw new Error('Unexpected aggregate fallback') })
  t.mock.method(rpc, 'jsonRpc', async (method, [request]) => {
    assert.equal(method, 'starknet_call')
    assert.equal(request.entry_point_selector, sdk.chains.starknet.getSelectorFromName('aggregate'))
    assert.deepEqual(request.calldata.map(BigInt), [
      '0x2', '0x11', sdk.chains.starknet.getSelectorFromName('balanceOf'), '0x1', '0x33',
      '0x22', sdk.chains.starknet.getSelectorFromName('balanceOf'), '0x1', '0x33',
    ].map(BigInt))
    return ['0x100', '0x2', '0x2', '0x20000000000001', '0x1', '0x2', '0x3', '0x0']
  })
  await adapter.starknet.tvl(api)
  assert.deepEqual(api.getBalances(), {
    [`starknet:${address('0x11')}`]: '340282366920938463463383614631022952449',
    [`starknet:${address('0x22')}`]: '3',
  })
})
