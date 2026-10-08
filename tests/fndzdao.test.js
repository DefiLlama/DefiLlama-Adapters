const assert = require('node:assert/strict')
const { test, mock } = require('node:test')
const { ChainApi } = require('@defillama/sdk')
const cache = require('../projects/helper/cache')

// A cold run must not depend on the retired API or its frozen vault list.
const legacyConfig = mock.method(cache, 'getConfig', async () => {
  throw new Error('Legacy FNDZ discovery is unavailable')
})
const adapter = require('../projects/fndzdao')
legacyConfig.mock.restore()

const DISPATCHER = '0x07036f5385AE6F4049f7788bD960f9Dd7fecC241'
const DEPLOYER = '0x53740625C2d3684De780621A07d661c4C09b13A7'
const VAULTS = [
  '0x53595b2aD82797155074958F568817f489ef4F3E',
  '0xcDbAa84E30A65dE64E0d3BD2F19a54f4b45CEA34',
]
const TOKEN = '0x55d398326f99059fF775485246999027B3197955'
const ZERO = '0x0000000000000000000000000000000000000000'
const BLOCK = 126498767

function createApi(t, { nonce = 3, block = BLOCK, registration = DEPLOYER } = {}) {
  const api = new ChainApi({ chain: 'bsc', block })
  api.provider = {
    getTransactionCount: async (address, requestedBlock) => {
      assert.equal(address, DISPATCHER)
      assert.equal(requestedBlock, block)
      return nonce
    },
  }
  const responses = {
    'function getFundDeployerForVaultProxy(address) view returns (address)': ({ target, calls }) => {
      assert.equal(target, DISPATCHER)
      assert.deepEqual(calls, VAULTS.slice(0, nonce - 1))
      return calls.map(() => registration)
    },
    'address[]:getTrackedAssets': ({ calls }) => {
      assert.deepEqual(calls, VAULTS.slice(0, nonce - 1))
      return calls.map(() => [TOKEN, TOKEN])
    },
    'erc20:balanceOf': ({ calls }) => calls.map(({ target, params }) => {
      assert.equal(target.toLowerCase(), TOKEN.toLowerCase())
      const balances = {
        [VAULTS[0].toLowerCase()]: '9007199254740993123456789',
        [VAULTS[1].toLowerCase()]: '11',
      }
      assert.ok(balances[params[0].toLowerCase()])
      return balances[params[0].toLowerCase()]
    }),
  }
  t.mock.method(api, 'multiCall', async request => {
    assert.equal(api.block, block)
    assert.ok(!request.permitFailure)
    assert.ok(responses[request.abi], `Unexpected ABI: ${request.abi}`)
    return responses[request.abi](request)
  })
  return api
}

test('discovers every CREATE vault without the API and sums custody through the real SDK', async t => {
  const api = createApi(t)
  assert.deepEqual(await adapter.bsc.tvl(api), {
    [TOKEN.toLowerCase().replace('0x', 'bsc:0x')]: '9007199254740993123456800',
  })
})

test('uses the historical nonce instead of discovering future vaults', async t => {
  const api = createApi(t, { nonce: 2, block: 20000000 })
  assert.deepEqual(await adapter.bsc.tvl(api), {
    [TOKEN.toLowerCase().replace('0x', 'bsc:0x')]: '9007199254740993123456789',
  })
})

test('resolves the balance block before reading the nonce', async t => {
  const api = createApi(t, { nonce: 2, block: 20000000 })
  api.block = undefined
  t.mock.method(api, 'getBlock', async () => { api.block = 20000000; return api.block })
  assert.deepEqual(await adapter.bsc.tvl(api), {
    'bsc:0x55d398326f99059ff775485246999027b3197955': '9007199254740993123456789',
  })
})

test('returns no vault balances before the dispatcher deployment', async t => {
  const api = createApi(t, { block: 18879112 })
  api.provider.getTransactionCount = async () => { throw new Error('Unexpected nonce read') }
  assert.deepEqual(await adapter.bsc.tvl(api), {})
})

test('handles an initialized dispatcher with no vaults', async t => {
  assert.deepEqual(await adapter.bsc.tvl(createApi(t, { nonce: 1 })), {})
})

for (const nonce of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) {
  test(`rejects invalid dispatcher nonce ${nonce}`, async t => {
    await assert.rejects(adapter.bsc.tvl(createApi(t, { nonce })), /nonce/i)
  })
}

test('rejects an unregistered derived address instead of reporting partial TVL', async t => {
  await assert.rejects(adapter.bsc.tvl(createApi(t, { registration: ZERO })), /vault/i)
})

test('rejects a truncated registration response instead of accepting partial discovery', async t => {
  const api = createApi(t)
  t.mock.method(api, 'multiCall', async () => [DEPLOYER])
  await assert.rejects(adapter.bsc.tvl(api), /vault/i)
})

test('propagates nonce RPC failures instead of using stale discovery', async t => {
  const api = createApi(t)
  api.provider.getTransactionCount = async () => { throw new Error('Nonce RPC unavailable') }
  await assert.rejects(adapter.bsc.tvl(api), /Nonce RPC unavailable/)
})

test('propagates a failed on-chain read instead of dropping a vault', async t => {
  const api = createApi(t)
  t.mock.method(api, 'multiCall', async () => { throw new Error('Contract read failed') })
  await assert.rejects(adapter.bsc.tvl(api), /Contract read failed/)
})

for (const abi of ['address[]:getTrackedAssets', 'erc20:balanceOf']) {
  test(`propagates ${abi} failures instead of omitting custody`, async t => {
    const api = createApi(t)
    const multiCall = api.multiCall.bind(api)
    t.mock.method(api, 'multiCall', async request => {
      if (request.abi === abi) throw new Error('Custody read failed')
      return multiCall(request)
    })
    await assert.rejects(adapter.bsc.tvl(api), /Custody read failed/)
  })
}

test('keeps the staking balance separate from vault TVL', async t => {
  const api = new ChainApi({ chain: 'bsc', block: BLOCK })
  t.mock.method(api, 'multiCall', async ({ abi, calls }) => {
    assert.equal(abi, 'erc20:balanceOf')
    assert.deepEqual(calls, [{
      target: '0x7754c0584372d29510c019136220f91e25a8f706',
      params: ['0x4910638b88c40ee382ced72a4056e2f859bd4658'],
    }])
    return ['1000000000000000001']
  })
  assert.deepEqual(await adapter.bsc.staking(api), {
    'bsc:0x7754c0584372d29510c019136220f91e25a8f706': '1000000000000000001',
  })
})
