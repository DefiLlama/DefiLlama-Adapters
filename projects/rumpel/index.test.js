const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { createRequire } = require('node:module')
const { join } = require('node:path')
const { test } = require('node:test')
const { runInNewContext } = require('node:vm')
const { ChainApi } = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')

const OWNER = '0x0000000000000000000000000000000000000001'
const VAULT = '0xeAEf563015634a9d0EE6CF1357A3b205C35e028D'
const SMART_VAULT = '0x7503b58Bb29937e7E2980f70D3FD021B7ebeA6d0'
const OTHER_VAULT = '0x0000000000000000000000000000000000000002'

function loadAdapter() {
  const filename = join(__dirname, 'index.js')
  const localRequire = createRequire(filename)
  const module = { exports: {} }
  const require = name => name === '../helper/cache/getLogs'
    ? { getLogs2: async () => [{ safe: OWNER }] }
    : localRequire(name)
  runInNewContext(readFileSync(filename, 'utf8'), { module, require }, { filename })
  return module.exports
}

function position(nftId, vault, supply) {
  return { nftId, vault, owner: OWNER, supply, borrow: '999999999999999999999' }
}

function createApi(positions, { chain = 'ethereum', ids = positions.map(p => p.nftId), fail } = {}) {
  const api = new ChainApi({ chain, block: 26145588 })
  api.sumTokens = async () => api.getBalances()
  const byId = new Map(positions.map(p => [p.nftId, p]))
  const handlers = {
    'erc20:balanceOf': () => '0',
    'function stakes(address,address) view returns (uint256 amount,uint152,uint104)': () => ({ amount: '0' }),
    'function position(bytes32,address) view returns (uint256,uint128,uint128 amount)': () => ({ amount: '0' }),
    'function balance(address,address) view returns (uint256)': () => '0',
    'function positionsNftIdOfUser(address) view returns (uint256[])': call => call.params[0] === OWNER ? ids : [],
    'function vaultByNftId(uint256) view returns (address)': call => byId.get(call.params[0]).vault,
    'function getPositionsForNftIds(uint256[]) view returns ((uint256 nftId,address owner,uint256 supply,uint256 borrow)[])': call => call.params[0].map(id => byId.get(id)),
  }
  api.multiCall = async ({ abi, calls }) => {
    if (abi === fail) throw new Error('RPC unavailable')
    assert.ok(handlers[abi], `Unexpected or unbounded RPC: ${abi}`)
    return calls.map(handlers[abi])
  }
  api.call = async ({ abi }) => {
    if (abi.includes('getTotalSupplySharesRaw')) return ((1n << 128n) + 100n).toString()
    assert.ok(abi.includes('getDexCollateralReserves'))
    return ['1000', '2000', '9000000', '9000000']
  }
  return api
}

test('counts only owned positions in configured vaults without scanning all Fluid NFTs', async () => {
  const api = createApi([
    position('1', VAULT, '3000000000000000000'),
    position('2', VAULT.toLowerCase(), '4000000000000000000'),
    position('3', OTHER_VAULT, '900000000000000000000'),
  ])
  await loadAdapter().ethereum.tvl(api)
  assert.equal(api.getBalances()[`ethereum:${ADDRESSES.ethereum.WEETH}`], '7000000000000000000')
  assert.equal(Object.values(api.getBalances()).filter(value => BigInt(value) !== 0n).length, 1)
})

test('counts each owned NFT once even if discovery repeats its ID', async () => {
  const api = createApi([position('1', VAULT, '123')], { ids: ['1', '1'] })
  await loadAdapter().ethereum.tvl(api)
  assert.equal(api.getBalances()[`ethereum:${ADDRESSES.ethereum.WEETH}`], '123')
})

test('preserves smart collateral shares and excludes imaginary reserves and debt', async () => {
  const api = createApi([position('1', SMART_VAULT, '25')])
  await loadAdapter().ethereum.tvl(api)
  assert.equal(api.getBalances()[`ethereum:${ADDRESSES.ethereum.sUSDe}`], '250')
  assert.equal(api.getBalances()[`ethereum:${ADDRESSES.ethereum.USDT}`], '500')
})

test('handles owners with no Fluid positions', async () => {
  const api = createApi([])
  await loadAdapter().ethereum.tvl(api)
  assert.ok(Object.values(api.getBalances()).every(value => BigInt(value) === 0n))
})

test('does not value positions from unconfigured vaults', async () => {
  const api = createApi([position('1', OTHER_VAULT, '123')])
  await loadAdapter().ethereum.tvl(api)
  assert.ok(Object.values(api.getBalances()).every(value => BigInt(value) === 0n))
})

test('propagates failed position reads instead of returning incomplete TVL', async () => {
  const api = createApi([position('1', VAULT, '123')], {
    fail: 'function getPositionsForNftIds(uint256[]) view returns ((uint256 nftId,address owner,uint256 supply,uint256 borrow)[])',
  })
  await assert.rejects(loadAdapter().ethereum.tvl(api), /RPC unavailable/)
})

test('does not query Ethereum Fluid positions for Hyperliquid', async () => {
  const api = createApi([], { chain: 'hyperliquid' })
  await loadAdapter().hyperliquid.tvl(api)
  assert.deepEqual(api.getBalances(), {})
})
