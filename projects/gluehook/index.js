const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { nullAddress } = require('../helper/tokenMapping')
const { ethers } = require('ethers')

// GlueHook (https://gluehook.trade) — a free, keyless, general-purpose Uniswap V4 hook:
// per-pool buyback pot (pump on buys, sell absorption), burn cascade, self-compounding LP.
// Not upgradeable, no owner/admin keys, 0% protocol fee.
// Deployed via CREATE from a nonce-0 deployer — SAME address on every chain of a given version.
// V2 is a fresh redeployment (Glue-integrated burns, static-fee-only). V1 pools remain live.
// Live metrics: https://dune.com/lalilulel0x0869/gluehook-live
const HOOK_V1 = '0xb216070c3509047ea597E2E626A29cea427a60C8'
const HOOK_V2 = '0x0F41715dc432692b66A5aDF8dCfef6Ac407b20c8'

// Uniswap V4 PoolManager + per-version hook deploy blocks
const config = {
  ethereum: {
    poolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90',
    hooks: [
      { address: HOOK_V1, fromBlock: 25703029 },
      { address: HOOK_V2, fromBlock: 25814686 },
    ],
  },
  base: {
    poolManager: '0x498581fF718922c3f8e6A244956aF099B2652b2b',
    hooks: [
      { address: HOOK_V1, fromBlock: 49657824 },
      { address: HOOK_V2, fromBlock: 50330047 },
    ],
  },
  unichain: {
    poolManager: '0x1F98400000000000000000000000000000000004',
    hooks: [
      { address: HOOK_V1, fromBlock: 55356883 },
      { address: HOOK_V2, fromBlock: 56701906 },
    ],
  },
  arbitrum: {
    poolManager: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32',
    hooks: [
      { address: HOOK_V1, fromBlock: 492046075 },
      { address: HOOK_V2, fromBlock: 497395639 },
    ],
  },
  optimism: {
    poolManager: '0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3',
    hooks: [
      { address: HOOK_V1, fromBlock: 155253116 },
      { address: HOOK_V2, fromBlock: 155925598 },
    ],
  },
  bsc: {
    poolManager: '0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF',
    hooks: [
      { address: HOOK_V1, fromBlock: 114546905 },
      { address: HOOK_V2, fromBlock: 117531972 },
    ],
  },
  polygon: {
    poolManager: '0x67366782805870060151383F4BbFF9daB53e5cD6',
    hooks: [
      { address: HOOK_V1, fromBlock: 91600016 },
      { address: HOOK_V2, fromBlock: 92496642 },
    ],
  },
  wc: {
    poolManager: '0xb1860D529182ac3BC1F51Fa2ABd56662b7D13f33',
    hooks: [
      { address: HOOK_V1, fromBlock: 33384712 },
      { address: HOOK_V2, fromBlock: 34057331 },
    ],
  },
  zora: { poolManager: '0x0575338e4C17006aE181B47900A84404247CA30f', hooks: [{ address: HOOK_V1, fromBlock: 49705618 }] },
  soneium: {
    poolManager: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32',
    hooks: [
      { address: HOOK_V1, fromBlock: 26485168 },
      { address: HOOK_V2, fromBlock: 27157781 },
    ],
  },
  megaeth: {
    poolManager: '0xaCB7e78fa05D562e0A5D3089ec896D57D057d38E',
    hooks: [
      { address: HOOK_V1, fromBlock: 23308084 },
      { address: HOOK_V2, fromBlock: 24653311 },
    ],
  },
  robinhood: {
    poolManager: '0x8366a39CC670B4001A1121B8F6A443A643e40951',
    hooks: [
      { address: HOOK_V1, fromBlock: 30206983 },
      { address: HOOK_V2, fromBlock: 43628009 },
    ],
  },
  tempo: { poolManager: '0x33620f62C5b9B2086dD6b62F4A297A9f30347029', hooks: [{ address: HOOK_V1, fromBlock: 33657201 }] },
  avax: {
    poolManager: '0x06380C0e0912312B5150364B9DC4542BA0DbBc85',
    hooks: [
      { address: HOOK_V1, fromBlock: 92242906 },
      { address: HOOK_V2, fromBlock: 93461396 },
    ],
  },
  blast: { poolManager: '0x1631559198A9e474033433b2958daBC135ab6446', hooks: [{ address: HOOK_V1, fromBlock: 38647660 }] },
  celo: { poolManager: '0x288dc841A52FCA2707c6947B3A777c5E56cd87BC', hooks: [{ address: HOOK_V1, fromBlock: 74204388 }] },
  monad: { poolManager: '0x188d586Ddcf52439676Ca21A244753fA19F9Ea8e', hooks: [{ address: HOOK_V1, fromBlock: 93918120 }] },
  xlayer: {
    poolManager: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32',
    hooks: [
      { address: HOOK_V1, fromBlock: 67336132 },
      { address: HOOK_V2, fromBlock: 68681331 },
    ],
  },
}

// emitted once when a pool's pot is initialized: carries the pool's token pair
const eventAbi = 'event PotInitialized(bytes32 indexed poolId, address main, address secondary, address recipient)'
const programAbi = 'function programOf(bytes32 poolId) view returns (tuple(uint128 liquidity, int24 tickLower, int24 tickUpper, bool exists, bool publicHarvest, uint64 buybackShareWad, address owner, uint64 burnShareWad, address secondaryRecipient, uint64 compoundShareWad, address mainRecipient, uint64 potCompoundShareWad, address operator, uint64 potBurnShareWad, uint256 minMain, uint256 minSecondary, uint256 carryMain, uint256 carrySecondary) program)'
const extsloadAbi = 'function extsload(bytes32 slot) view returns (bytes32)'

const Q96 = 2 ** 96
const MIN_TICK = -887272
const MAX_TICK = 887272

// storage slot of a pool's slot0 inside the PoolManager: keccak(poolId . uint256(6))
function slot0Slot(poolId) {
  return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['bytes32', 'uint256'], [poolId, 6]))
}

// the token amounts a position (liquidity, tick range) is worth at the live price.
// Float math: 1e-15 relative error is irrelevant for TVL, and it avoids
// reimplementing the 20-constant fixed-point TickMath table.
function positionAmounts(sqrtPriceX96, tickLower, tickUpper, liquidity) {
  const L = Number(liquidity)
  if (!L) return [0, 0]
  // sentinel (0,0) = full range
  if (tickLower === 0 && tickUpper === 0) { tickLower = MIN_TICK; tickUpper = MAX_TICK }
  let sA = Math.pow(1.0001, tickLower / 2) * Q96
  let sB = Math.pow(1.0001, tickUpper / 2) * Q96
  if (sA > sB) [sA, sB] = [sB, sA]
  // clamping the price into the range collapses the three-case formula:
  // below range → all token0, above → all token1, inside → both legs
  const P = Math.min(Math.max(Number(sqrtPriceX96), sA), sB)
  const amount0 = (L * Q96 * (sB - P)) / (sB * P)
  const amount1 = (L * (P - sA)) / Q96
  return [Math.floor(amount0), Math.floor(amount1)]
}

async function addHookTvl(api, poolManager, hook) {
  const logs = await getLogs2({ api, target: hook.address, eventAbi, fromBlock: hook.fromBlock })

  // 1. the hook's own balances: buyback pots, parked donations, pending
  //    fee splits, permanently-held (unburnable) tokens
  const tokens = [nullAddress]
  logs.forEach((log) => tokens.push(log.main, log.secondary))

  // 2. the hook-owned LP: each pool's program position lives inside the
  //    PoolManager under the hook's own address. Value it from the
  //    program's liquidity at the pool's live sqrtPrice (both read on-chain).
  const poolIds = logs.map((log) => log.poolId)
  if (poolIds.length) {
    const [programs, slot0s] = await Promise.all([
      api.multiCall({ abi: programAbi, target: hook.address, calls: poolIds }),
      api.multiCall({ abi: extsloadAbi, target: poolManager, calls: poolIds.map(slot0Slot) }),
    ])
    logs.forEach((log, i) => {
      const p = programs[i]
      if (!p || !p.exists) return
      const sqrtPriceX96 = BigInt(slot0s[i]) & ((1n << 160n) - 1n)
      if (!sqrtPriceX96) return
      const [amount0, amount1] = positionAmounts(sqrtPriceX96, Number(p.tickLower), Number(p.tickUpper), p.liquidity)
      // v4 orders the pair by address, native (0x0) first
      const [token0, token1] = [log.main, log.secondary].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      api.add(token0, amount0)
      api.add(token1, amount1)
    })
  }

  return tokens
}

Object.keys(config).forEach((chain) => {
  const { poolManager, hooks } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = []
      for (const hook of hooks) {
        tokens.push(...(await addHookTvl(api, poolManager, hook)))
      }
      return sumTokens2({ api, owners: hooks.map((h) => h.address), tokens })
    },
  }
})

module.exports.methodology =
  'TVL = the liquidity of every hook-owned LP program position inside the Uniswap V4 PoolManager (valued from the program liquidity at the pool\'s live price) + every token held by the GlueHook contracts themselves (per-pool buyback pots, parked donations, pending fee splits, permanently-held unburnable tokens). Pools are enumerated from PotInitialized events on both the original (V1) hook and the V2 redeployment. Live metrics: https://dune.com/lalilulel0x0869/gluehook-live'
// the same tokens are also counted by the uniswap-v4 adapter (PoolManager balances),
// same as other hook protocols e.g. bunni-v2
module.exports.doublecounted = true
