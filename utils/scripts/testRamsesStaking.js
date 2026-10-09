const assert = require('node:assert/strict')
const { test } = require('node:test')
const sdk = require('@defillama/sdk')
const registry = require('../../registries/uniswapV2')
const v3Registry = require('../../registries/uniswapV3')
const dlmmRegistry = require('../../registries/traderJoeV2')

const ram = '0x555570a286F15EbDFE42B66eDE2f724Aa1AB5555'
const xRam = '0xAE6D5FcE541216BDA471D311425B5412D9f1DEb9'
const voteModule = '0x6736102621f7c0dbB0E2989e3ad7A8793e71930b'
const staking = registry['ramses-legacy-v2'].hyperliquid.staking

// Keep the real registry builder and ChainApi balance accounting; fixture only RPC responses.
function fixtureApi(backing, supply, staked, failingTarget) {
  const api = new sdk.ChainApi({ chain: 'hyperliquid', block: 19052644 })
  const calls = []
  api.call = async (request) => {
    calls.push(request)
    if (request.target === failingTarget) throw new Error('RPC unavailable')
    if (request.target === ram && request.abi === 'erc20:balanceOf') {
      assert.deepEqual(request.params, [xRam])
      return backing
    }
    assert.equal(request.abi, 'uint256:totalSupply')
    if (request.target === xRam) return supply
    if (request.target === voteModule) return staked
    throw new Error(`Unexpected target: ${request.target}`)
  }
  return { api, calls }
}

test('canonical HyperEVM staking has one Ramses registry owner and unchanged factories', async () => {
  const owners = [registry, v3Registry, dlmmRegistry].flatMap(entries => Object.entries(entries).filter(([name, exports]) => name.startsWith('ramses') && exports.hyperliquid?.staking).map(([name]) => name))
  assert.deepEqual(owners, ['ramses-legacy-v2'])
  assert.deepEqual(Object.entries(registry['ramses-legacy-v2']).filter(([, value]) => value?.staking).map(([chain]) => chain), ['hyperliquid'])
  const raw = registry._rawConfigs['ramses-legacy-v2']
  assert.equal(raw.hyperliquid.factory, '0xd0a07E160511c40ccD5340e94660E9C9c01b0D27')
  assert.equal(staking, raw.hyperliquid.staking)
  assert.equal(raw.arbitrum, '0xADd32480630A16dfAcEe6eeFcB3ab2181449Dc3B')
  assert.equal(raw.polygon, '0xA87c8308722237F6442Ef4762B7287afB84fB191')
  assert.equal(raw.robinhood, '0x43B2Bf9f33036a02fC7A00935571c2A6b0108e66')
  assert.deepEqual(registry._rawConfigs.ramses.arbitrum.staking, ['0xAAA343032aA79eE9a6897Dab03bef967c3289a06', '0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418'])
  let legacyRequest
  await registry.ramses.arbitrum.staking({ sumTokens: async (request) => { legacyRequest = request } })
  assert.deepEqual(legacyRequest, { owners: ['0xAAA343032aA79eE9a6897Dab03bef967c3289a06'], tokens: ['0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418'] })
})

test('bootstrap stake excludes the large idle initial supply', async () => {
  const { api, calls } = fixtureApi('100000050000000000000000000', '200000100000000000000000000', '100000000000000000000')
  await staking(api)
  assert.deepEqual(api.getBalances(), { [`hyperliquid:${ram}`]: '50000000000000000000' })
  assert.equal(calls.length, 3)
  assert.ok(calls.every(call => !call.permitFailure))
})

test('large raw units retain integer precision and use live backing rather than a fixed redemption ratio', async () => {
  const { api } = fixtureApi('100000000000000000000000001', '300000000000000000000000000', '100000000000000000000000000')
  await staking(api)
  assert.deepEqual(api.getBalances(), { [`hyperliquid:${ram}`]: '33333333333333333333333333' })
})

test('zero supply is empty before bootstrap and rejects impossible stake', async () => {
  const { api } = fixtureApi('0', '0', '0')
  await staking(api)
  assert.deepEqual(api.getBalances(), {})
  await assert.rejects(staking(fixtureApi('0', '0', '1').api), /staked xRAM with zero total supply/)
})

test('each required RPC failure propagates without adding balances', async () => {
  for (const target of [ram, xRam, voteModule]) {
    const { api } = fixtureApi('100', '200', '100', target)
    await assert.rejects(staking(api), /RPC unavailable/)
    assert.deepEqual(api.getBalances(), {})
  }
})
