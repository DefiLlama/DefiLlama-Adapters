const ADDRESSES = require('../coreAssets.json')
const { ethers } = require('ethers')
const { post } = require('../http')
const { sliceIntoChunks } = require('../utils')

const RPC_URL = 'https://noderpc.strato.nexus/rpc'
if (!process.env.STRATO_RPC) process.env.STRATO_RPC = RPC_URL

const POOL_FACTORY    = '0x000000000000000000000000000000000000100a'
const POOL_V3_FACTORY = '0x5d630126d908b46bcf8d00bc15e591a459375809'

const BATCH_SIZE = 100
const ENUMERATE_PAGE = 50
const lc = (address) => address.toLowerCase()

// STRATO has no Multicall3 and its node does not take eth_call state overrides, so reads that do not
// depend on each other go out together as one JSON-RPC batch request. Results come back in call order;
// with permitFailure a reverted or empty call is null instead of an error.
async function batchCall(calls, { permitFailure = false } = {}) {
  const out = []
  for (const chunk of sliceIntoChunks(calls, BATCH_SIZE)) {
    const ifaces = chunk.map(({ abi }) => new ethers.Interface([abi]))
    const body = chunk.map(({ target, params = [] }, id) => ({
      jsonrpc: '2.0', id, method: 'eth_call',
      params: [{ to: target, data: ifaces[id].encodeFunctionData(ifaces[id].fragments[0], [].concat(params)) }, 'latest'],
    }))
    const res = await post(process.env.STRATO_RPC.split(',')[0], body)
    if (!Array.isArray(res)) throw new Error(`[strato] batch request failed: ${JSON.stringify(res).slice(0, 200)}`)
    const byId = new Map(res.map((r) => [r.id, r]))
    chunk.forEach(({ target }, id) => {
      const r = byId.get(id)
      if (!r || r.error || !r.result || r.result === '0x') {
        if (!permitFailure) throw new Error(`[strato] ${ifaces[id].fragments[0].name} failed on ${target}: ${JSON.stringify(r?.error ?? r)}`)
        return out.push(null)
      }
      const decoded = ifaces[id].decodeFunctionResult(ifaces[id].fragments[0], r.result)
      out.push(decoded.length === 1 ? decoded[0] : decoded)
    })
  }
  return out
}

// Reads `abi(i)` for i = 0, 1, 2... until the first revert or null address.
async function enumerateArray(target, abi, max = 500) {
  const seen = new Set()
  const out = []
  for (let start = 0; start < max; start += ENUMERATE_PAGE) {
    const indexes = Array.from({ length: Math.min(ENUMERATE_PAGE, max - start) }, (_, i) => start + i)
    const res = await batchCall(indexes.map((i) => ({ target, abi, params: [i] })), { permitFailure: true })
    for (const r of res) {
      if (!r || r === ADDRESSES.null) return out
      if (!seen.has(lc(r))) { seen.add(lc(r)); out.push(lc(r)) }
    }
  }
  console.warn(`[strato] enumerateArray hit cap ${max} on ${target} — likely truncated`)
  return out
}

// Constant-product and StablePool swap pools from PoolFactory. Pools are not ERC20s (no LP token).
async function getV2Pools() {
  const poolAddrs = await enumerateArray(POOL_FACTORY, 'function allPools(uint256) view returns (address)')
  // StablePool can hold more than two coins (e.g. USDT-USDC-USDST). tokenA/tokenB
  // only expose the first two, so enumerate the full `coins` array instead.
  // Legacy pools have no isStable(): the failed read counts as not stable.
  const isStable = await batchCall(poolAddrs.map((target) => ({ target, abi: 'function isStable() view returns (bool)' })), { permitFailure: true })
  const stablePools = poolAddrs.filter((_, i) => isStable[i])
  const plainPools = poolAddrs.filter((_, i) => !isStable[i])

  const numCoins = await batchCall(stablePools.map((target) => ({ target, abi: 'function getNumCoins() view returns (uint256)' })))
  const coinCalls = stablePools.flatMap((target, i) => Array.from({ length: Number(numCoins[i]) }, (_, j) => ({ target, abi: 'function coins(uint256) view returns (address)', params: [j] })))
  const coins = await batchCall(coinCalls)
  const tokensA = await batchCall(plainPools.map((target) => ({ target, abi: 'function tokenA() view returns (address)' })))
  const tokensB = await batchCall(plainPools.map((target) => ({ target, abi: 'function tokenB() view returns (address)' })))

  const tokens = new Map(poolAddrs.map((pool) => [pool, new Set()]))
  coinCalls.forEach(({ target }, i) => tokens.get(target).add(lc(coins[i])))
  plainPools.forEach((pool, i) => tokens.get(pool).add(lc(tokensA[i])).add(lc(tokensB[i])))
  return poolAddrs.map((pool, i) => ({ pool, tokens: [...tokens.get(pool)], isStable: !!isStable[i] }))
}

// Concentrated-liquidity (Uniswap-v3 style) pools from PoolV3Factory. Token balances held by the
// pool contract are the TVL; positions are accounted inside the pool.
async function getV3Pools() {
  const poolAddrs = await enumerateArray(POOL_V3_FACTORY, 'function allPools(uint256) view returns (address)')
  const tokens0 = await batchCall(poolAddrs.map((target) => ({ target, abi: 'function token0() view returns (address)' })))
  const tokens1 = await batchCall(poolAddrs.map((target) => ({ target, abi: 'function token1() view returns (address)' })))
  return poolAddrs.map((pool, i) => ({ pool, tokens: [lc(tokens0[i]), lc(tokens1[i])] }))
}

// Sum of every pool token held by every v2 + v3 pool.
async function sumPoolBalances(api, pools) {
  const pairs = pools.flatMap(({ pool, tokens }) => tokens.map((token) => ({ holder: pool, token })))
  const balances = await batchCall(pairs.map(({ token, holder }) => ({ target: token, abi: 'function balanceOf(address) view returns (uint256)', params: [holder] })))
  pairs.forEach(({ token }, i) => { if (balances[i] > 0n) api.add(token, balances[i].toString()) })
}

module.exports = {
  RPC_URL,
  POOL_FACTORY,
  POOL_V3_FACTORY,
  lc,
  batchCall,
  enumerateArray,
  getV2Pools,
  getV3Pools,
  sumPoolBalances,
}
