const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const { AbiCoder, keccak256, ZeroAddress, ZeroHash } = require('ethers')
const { decodeChunks, inventory } = require('../projects/panoptic-v2/liquidity')
const { getSqrtPriceX96AtTick } = require('../projects/helper/utils/tick')

const address = value => '0x' + value.toString(16).padStart(40, '0')
const TOKEN0 = address(1)
const TOKEN1 = address(2)
const POOL = address(3)
const TRACKER0 = address(4)
const TRACKER1 = address(5)
const VAULT = address(6)
const ACCOUNTANT = address(7)
const EXTERNAL = address(8)
const USER = address(9)
const UNDERLYING = address(10)
const SFPM = address(11)
const FACTORY = address(12)
const Q96 = 1n << 96n
const coder = AbiCoder.defaultAbiCoder()

function tokenId(legs = [{}], pattern = 1n) {
  return legs.reduce((id, leg, index) => {
    const { asset = 0n, ratio = 1n, long = 0n, tokenType = 0n, strike = 10n, width = 2n } = leg
    const raw = asset | (ratio << 1n) | (long << 8n) | (tokenType << 9n) | (BigInt.asUintN(24, strike) << 12n) | (width << 36n)
    return id | (raw << (64n + BigInt(index) * 48n))
  }, (10n << 48n) | pattern)
}

function fixture({ version = 'v3', block = 200, external = [], configuredHash, poolLogs, mints, liquidity = 10006n, idle = 20n, poolBalance = 50n, externalAsset = TOKEN0, poolToken0 = TOKEN0, failedPoolReads = 0, reverse = false } = {}) {
  const chain = {
    startBlock: 100, sfpmStartBlock: 100, factories: [{ target: FACTORY, version }],
    sfpms: [{ target: SFPM, version }], wrappedNative: TOKEN1, stateView: address(13),
    vaults: [{ address: VAULT, fromBlock: 150, erc4626s: external }],
  }
  const requests = []
  const messages = []
  const balances = new Map()
  let remainingPoolFailures = failedPoolReads
  const logs = {
    pools: poolLogs ?? [{ blockNumber: 100, args: { poolAddress: POOL, collateralTracker0: TRACKER0, collateralTracker1: TRACKER1 } }],
    mints: mints ?? [],
  }
  const file = path.resolve(__dirname, '../projects/panoptic-v2/tvl.js')
  const realRequire = createRequire(file)
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    module,
    require(name) {
      if (name === './config') return { ethereum: chain }
      if (name === '../helper/cache/getLogs') return { getLogs2: async options => {
        assert.equal(options.toBlock, block)
        return options.eventAbi.includes('PoolDeployed') ? logs.pools : logs.mints
      } }
      return realRequire(name)
    },
  }, { filename: file })
  const api = {
    chain: 'ethereum', block,
    async getBlock() { return block },
    log(message) { messages.push(message) },
    add(token, amount) { token = token.toLowerCase(); balances.set(token, (balances.get(token) ?? 0n) + BigInt(amount)) },
    addGasToken(amount) { this.add(ZeroAddress, amount) },
    async sumTokens({ tokensAndOwners, permitFailure }) {
      assert.equal(permitFailure, false)
      assert.equal(new Set(tokensAndOwners.map(pair => pair.join(':'))).size, tokensAndOwners.length)
      for (const [token, owner] of tokensAndOwners) {
        assert.equal(owner, VAULT)
        assert.notEqual(token, TRACKER0)
        assert.notEqual(token, TRACKER1)
        assert.notEqual(token, EXTERNAL)
        if (token === TOKEN0) this.add(token, idle)
      }
    },
    async multiCall(options) {
      requests.push(options)
      return options.calls.map(call => {
        const target = (typeof call === 'string' ? call : call.target ?? options.target)?.toLowerCase()
        if (options.abi.includes('underlyingToken')) return TOKEN0
        if (options.abi.includes('accountant')) return ACCOUNTANT
        if (options.abi.includes('vaultHashes')) return configuredHash ?? keccak256(coder.encode(['address[]'], [external.filter(item => item.fromBlock <= block && (item.toBlock === undefined || block < item.toBlock)).map(item => item.address)]))
        if (options.abi.includes('totalAssets')) return target === TRACKER0 ? poolBalance.toString() : '0'
        if (options.abi.includes('asset')) return target === EXTERNAL ? externalAsset : target === TRACKER0 ? poolToken0 : TOKEN1
        if (options.abi.includes('balanceOf')) {
          if (target === poolToken0 && options.permitFailure && remainingPoolFailures > 0) {
            remainingPoolFailures--
            return undefined
          }
          return '30'
        }
        if (options.abi.includes('convertToAssets')) { assert.equal(call.params, '30'); return '30' }
        if (options.abi.includes('getUniswapV3PoolFromId')) return UNDERLYING
        if (options.abi.includes('getUniswapV4PoolKeyFromId')) return { currency0: ZeroAddress, currency1: TOKEN0, fee: 500, tickSpacing: 10, hooks: ZeroAddress }
        if (options.abi.includes('token0')) return reverse ? TOKEN1 : TOKEN0
        if (options.abi.includes('token1')) return reverse ? TOKEN0 : TOKEN1
        if (options.abi.includes('slot0') || options.abi.includes('getSlot0')) return { sqrtPriceX96: Q96.toString() }
        if (options.abi.includes('getAccountLiquidity')) return liquidity.toString()
        throw new Error(`Unexpected call: ${options.abi}`)
      })
    },
  }
  return { api, balances, messages, requests, chain, run: () => module.exports.tvl(api) }
}

const mint = (owner = USER, id = tokenId(), blockNumber = 160) => ({ blockNumber, args: { caller: owner, tokenId: id.toString() } })

test('vault idle and external shares augment pool assets without adding collateral receipts', async () => {
  const f = fixture({ external: [{ address: EXTERNAL, fromBlock: 150 }] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 100n)
  assert.equal(f.requests.filter(request => request.abi.includes('totalAssets')).flatMap(request => request.calls).length, 2)
})

test('external receipt backed by an already-counted collateral tracker is excluded', async () => {
  const f = fixture({ external: [{ address: TRACKER0, fromBlock: 150 }] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 70n)
  assert.equal(f.requests.some(request => request.abi.includes('convertToAssets')), false)
})

test('unknown external allocation hash fails instead of reporting partial TVL', async () => {
  const f = fixture({ configuredHash: '0x' + '11'.repeat(32) })
  await assert.rejects(f.run, /Unverified ERC-4626 allocations/)
})

test('nested or mismatched external asset fails', async () => {
  for (const externalAsset of [TRACKER0, EXTERNAL, TOKEN1]) {
    const f = fixture({ external: [{ address: EXTERNAL, fromBlock: 150 }], externalAsset })
    await assert.rejects(f.run, /Unsupported ERC-4626 backing/)
  }
})

test('overlapping external allocation entries cannot count the same shares twice', async () => {
  const f = fixture({ external: [{ address: EXTERNAL, fromBlock: 150 }, { address: EXTERNAL, fromBlock: 160 }] })
  await assert.rejects(f.run, /Duplicate ERC-4626 allocation/)
})

test('vault creation and allocation effective blocks are respected', async () => {
  const before = fixture({ block: 149, configuredHash: ZeroHash })
  await before.run()
  assert.equal(before.balances.get(TOKEN0), 50n)
  assert.equal(before.requests.some(request => request.abi.includes('vaultHashes')), false)
  const f = fixture({ external: [{ address: EXTERNAL, fromBlock: 201 }] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 70n)
})

test('duplicate pool deployments and vault entries do not duplicate balances', async () => {
  const log = { blockNumber: 100, args: { poolAddress: POOL, collateralTracker0: TRACKER0, collateralTracker1: TRACKER1 } }
  const f = fixture({ poolLogs: [log, log] })
  f.chain.vaults.push({ ...f.chain.vaults[0] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 70n)
})

test('permissionless pool tokens are isolated from strict vault balance reads', async () => {
  const f = fixture({ poolToken0: USER, poolBalance: 0n })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 20n)
  assert.equal(f.balances.get(USER), 30n)
  const poolReads = f.requests.filter(request => request.abi.includes('balanceOf') && request.permitFailure)
  assert.equal(poolReads.length, 1)
  assert.equal(poolReads[0].calls.length, 1)
  assert.equal(poolReads[0].calls[0].target, USER)
  assert.equal(poolReads[0].calls[0].params, VAULT)
})

test('pool-token balance reads retry once and report persistent failures', async () => {
  const transient = fixture({ poolToken0: USER, poolBalance: 0n, failedPoolReads: 1 })
  await transient.run()
  assert.equal(transient.balances.get(USER), 30n)
  assert.equal(transient.requests.filter(request => request.abi.includes('balanceOf') && request.permitFailure).length, 2)
  assert.deepEqual(transient.messages, [])

  const persistent = fixture({ poolToken0: USER, poolBalance: 0n, failedPoolReads: 2 })
  await persistent.run()
  assert.equal(persistent.balances.has(USER), false)
  assert.match(persistent.messages[0], /skipping unreadable pool-token balances/)
})

test('allocation end blocks remove expired entries before hash validation', async () => {
  const f = fixture({ external: [{ address: EXTERNAL, fromBlock: 150, toBlock: 200 }] })
  await f.run()
  assert.equal(f.requests.some(request => request.abi.includes('convertToAssets')), false)
})

test('a failed required state read cannot silently become zero TVL', async () => {
  const f = fixture({ mints: [mint()] })
  const read = f.api.multiCall.bind(f.api)
  f.api.multiCall = options => {
    if (options.abi.includes('getAccountLiquidity')) throw new Error('Historical RPC unavailable')
    return read(options)
  }
  await assert.rejects(f.run, /Historical RPC unavailable/)
})

test('normal Panoptic mints add no standalone SFPM inventory', async () => {
  const f = fixture({ mints: [mint(POOL)] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 70n)
  assert.equal(f.requests.some(request => request.abi.includes('getAccountLiquidity')), false)
})

test('direct and pool-owned chunks on the same market are separated and repeated token IDs are deduplicated', async () => {
  const id = tokenId([{ ratio: 2n }])
  const f = fixture({ mints: [mint(POOL), mint(), mint(), mint(USER, id)] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 80n)
  const reads = f.requests.filter(request => request.abi.includes('getAccountLiquidity'))
  assert.equal(reads.flatMap(request => request.calls).length, 1)
  assert.equal(reads[0].calls[0].params[1], USER)
})

test('different encoded SFPM pool IDs resolving to one range are counted once', async () => {
  const f = fixture({ mints: [mint(), mint(USER, tokenId([{}], 2n))] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 80n)
  assert.equal(f.requests.filter(request => request.abi.includes('getAccountLiquidity')).flatMap(request => request.calls).length, 1)
})

test('direct vault LP is counted once alongside idle assets after redeployment', async () => {
  const f = fixture({ idle: 10n, external: [{ address: EXTERNAL, fromBlock: 150 }], mints: [mint(VAULT)] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 100n)
})

test('snapshot liquidity reflects partial burns, full closes, removed liquidity, and swap round trips', async () => {
  for (const [liquidity, expected] of [[10006n, 80n], [5003n, 75n], [0n, 70n], [10006n << 128n, 70n]]) {
    const f = fixture({ mints: [mint()], liquidity })
    await f.run()
    assert.equal(f.balances.get(TOKEN0), expected)
  }
})

test('future deployment and mint logs cannot leak into historical snapshots', async () => {
  const f = fixture({ poolLogs: [{ blockNumber: 201, args: { poolAddress: POOL, collateralTracker0: TRACKER0, collateralTracker1: TRACKER1 } }], mints: [mint(USER, tokenId(), 201)] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 20n)
})

test('V4 uses native currency and the complete PoolKey', async () => {
  const f = fixture({ version: 'v4', mints: [mint()] })
  await f.run()
  assert.equal(f.balances.get(ZeroAddress), 10n)
  const read = f.requests.find(request => request.abi.includes('getAccountLiquidity'))
  const decoded = coder.decode(['tuple(address,address,uint24,int24,address)'], read.calls[0].params[0])[0]
  assert.equal(decoded[0], ZeroAddress)
  assert.equal(decoded[3], 10n)
})

test('both token orderings preserve the actual pool currencies', async () => {
  const f = fixture({ reverse: true, mints: [mint()] })
  await f.run()
  assert.equal(f.balances.get(TOKEN0), 70n)
  assert.equal(f.balances.get(TOKEN1), 10n)
})

test('multi-leg mixed-asset frames decode all liquidity ranges and ignore zero-width credits', () => {
  const chunks = decodeChunks(tokenId([{ asset: 0n, tokenType: 0n }, { asset: 1n, tokenType: 1n, long: 1n, strike: -10n }, { width: 0n, ratio: 89n }]), USER)
  assert.deepEqual(chunks.map(chunk => [chunk.tokenType, chunk.tickLower, chunk.tickUpper]), [[0, 0, 20], [1, -20, 0]])
})

test('odd range widths use the protocol floor for the lower bound and ceiling for the upper bound', () => {
  const id = (tokenId([{ strike: 1n, width: 3n }]) & ~(((1n << 16n) - 1n) << 48n)) | (3n << 48n)
  const [chunk] = decodeChunks(id, USER)
  assert.equal(chunk.tickLower, -3)
  assert.equal(chunk.tickUpper, 6)
})

test('precise inventory handles below, inside, and above range with balances beyond Number precision', () => {
  const liquidity = (1n << 120n) + 123456789n
  const a = getSqrtPriceX96AtTick(-100)
  const b = getSqrtPriceX96AtTick(100)
  assert.deepEqual(inventory(liquidity, a, -100, 100), [liquidity * Q96 * (b - a) / (a * b), 0n])
  assert.deepEqual(inventory(liquidity, b, -100, 100), [0n, liquidity * (b - a) / Q96])
  const middle = inventory(liquidity, Q96, -100, 100)
  assert.ok(middle[0] > 0n && middle[1] > 0n)
  assert.ok(middle[0] > BigInt(Number.MAX_SAFE_INTEGER))
})
