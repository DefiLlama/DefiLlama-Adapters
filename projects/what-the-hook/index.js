const { getLogs2 } = require('../helper/cache/getLogs')
const { ethers } = require('ethers')
const { tickToPrice } = require('../helper/utils/tick')

const HOOK = '0xc52fc52698479e42f0da9a8a75296ec3871454c0'
const POOL_MANAGER = '0x8366a39CC670B4001A1121B8F6A443A643e40951'
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'
const FROM_BLOCK = 27190942

// the protocol's token
const WTH = '0xb8fa8010833463aac5595b55b9045479239eff79'

/* The hook announces every pool that registers with it, so the pools are
 * discovered at the hook rather than by reading every Initialize the
 * PoolManager has ever emitted and discarding almost all of it: 45 logs
 * instead of 153,720. Initialize is still read, but only for those 45 ids
 * — it is the one place the pair's two currencies are on chain, since a
 * v4 PoolKey is hashed into the id and never stored. */
const registeredAbi = 'event PoolRegistered(address indexed token, bytes32 indexed poolId, uint24 fee, int24 tickSpacing)'
const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'

const getSlot0Abi = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const getTickBitmapAbi = 'function getTickBitmap(bytes32 poolId, int16 wordPos) view returns (uint256)'
const getTickInfoAbi = 'function getTickInfo(bytes32 poolId, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128)'

const MIN_TICK = -887272
const MAX_TICK = 887272

// for each pool, enumerate its ticks using the same float math helper/unwrapLPs' addUniV3LikePosition uses
function reserves({ sqrtP, ticks, nets }) {
  const sp = Number(sqrtP) / 2 ** 96 // current sqrt price
  let amount0 = 0
  let amount1 = 0
  let liquidity = 0
  for (let i = 0; i < ticks.length - 1; i++) {
    liquidity += Number(nets[ticks[i]] ?? 0n)
    if (liquidity <= 0) continue
    const a = tickToPrice(ticks[i] / 2)
    const b = tickToPrice(ticks[i + 1] / 2)
    if (b <= sp) {
      amount1 += liquidity * (b - a)
    } else if (a >= sp) {
      amount0 += liquidity * (b - a) / (a * b)
    } else {
      amount1 += liquidity * (sp - a)
      amount0 += liquidity * (b - sp) / (sp * b)
    }
  }
  return { amount0, amount1 }
}

async function tvl(api, isStaking) {
  // every pool that runs the hook, announced by the hook itself
  const registered = await getLogs2({
    api, target: HOOK, eventAbi: registeredAbi, fromBlock: FROM_BLOCK,
    extraKey: 'wth-registered',
  })

  /* Read positionally. A fresh call hands back ethers Result objects that
   * also answer to log.poolId, but a cached one has been through JSON and
   * comes back a bare array — the names are gone and every named lookup is
   * silently undefined, which reads as "this hook has no pools". */
  const POOL_ID = 1, REG_TICK_SPACING = 3
  const spacingById = {}
  for (const log of registered) spacingById[String(log[POOL_ID]).toLowerCase()] = Number(log[REG_TICK_SPACING])
  const ids = Object.keys(spacingById)
  if (!ids.length) throw new Error('what-the-hook: the hook reports no registered pools — log fetch likely failed')

  const initialize = await getLogs2({
    api, target: POOL_MANAGER, eventAbi: initializeAbi, fromBlock: FROM_BLOCK,
    topics: [ethers.id('Initialize(bytes32,address,address,uint24,int24,address,uint160,int24)'), ids],
    onlyArgs: false, extraKey: 'wth-init-by-id',
  })
  const ID = 0, CURRENCY0 = 1, CURRENCY1 = 2
  let pools = initialize.map((log) => {
    const args = log.args ?? log
    const id = String(args[ID])
    return {
      id,
      token0: args[CURRENCY0],
      token1: args[CURRENCY1],
      spacing: spacingById[id.toLowerCase()],
    }
  })
  if (pools.length !== ids.length)
    throw new Error(`what-the-hook: ${ids.length} pools registered but ${pools.length} Initialize logs found`)

  // count only WTH for staking, all other tokens for tvl
  if (isStaking) pools = pools.filter((p) => p.token0.toLowerCase() === WTH || p.token1.toLowerCase() === WTH)
  if (!pools.length) return

  // slot0 contains the price; a pool that never got one is uninitialised
  const slot0s = await api.multiCall({
    abi: getSlot0Abi, target: STATE_VIEW,
    calls: pools.map((p) => ({ params: [p.id] })),
  })
  const live = []
  slot0s.forEach((s, i) => {
    const sqrtP = BigInt(s.sqrtPriceX96)
    if (sqrtP > 0n) live.push({ ...pools[i], sqrtP, ticks: [], nets: {} })
  })
  // same reasoning: every one of these pools has traded, so none of them
  // can honestly report no price
  if (!live.length) throw new Error('what-the-hook: no initialised pools among ' + pools.length + ' — state read likely failed')

  // every word of every pool's tick bitmap, in one flat call
  const words = []
  live.forEach((p, i) => {
    const lo = Math.floor(MIN_TICK / p.spacing) >> 8
    const hi = Math.floor(MAX_TICK / p.spacing) >> 8
    for (let w = lo; w <= hi; w++) words.push({ pool: i, word: w })
  })
  const bitmaps = await api.multiCall({
    abi: getTickBitmapAbi, target: STATE_VIEW,
    calls: words.map(({ pool, word }) => ({ params: [live[pool].id, word] })),
  })
  bitmaps.forEach((raw, i) => {
    const bits = BigInt(raw)
    if (bits === 0n) return
    const { pool, word } = words[i]
    for (let b = 0; b < 256; b++)
      if ((bits >> BigInt(b)) & 1n) live[pool].ticks.push(((word << 8) + b) * live[pool].spacing)
  })

  // liquidityNet per tick, retrieved from the StateView contract
  const tickCalls = []
  live.forEach((p, i) => {
    p.ticks.sort((a, b) => a - b)
    p.ticks.forEach((tick) => tickCalls.push({ pool: i, tick }))
  })
  if (tickCalls.length) {
    const tickData = await api.multiCall({
      abi: getTickInfoAbi, target: STATE_VIEW,
      calls: tickCalls.map(({ pool, tick }) => ({ params: [live[pool].id, tick] })),
    })
    tickData.forEach((info, i) => {
      const { pool, tick } = tickCalls[i]
      live[pool].nets[tick] = BigInt(info.liquidityNet)
    })
  }

  live.forEach((p) => {
    const { amount0, amount1 } = reserves(p)
    for (const [token, amount] of [[p.token0, amount0], [p.token1, amount1]]) {
      if (amount <= 0) continue
      if ((token.toLowerCase() === WTH) === isStaking) api.add(token, amount) // WTH -> staking, rest -> tvl
    }
  })
}

module.exports = {
  methodology: "Counts the liquidity held in every Uniswap v4 pool that runs the WTH hook. Pools are discovered from the hook's own PoolRegistered event, so pools opened later by third parties are picked up without a code change. Because v4 keeps every pool inside one PoolManager singleton, each pool's reserves are reconstructed from its state read via the v4 StateView contract's getSlot0, getTickBitmap and getTickInfo. WTH, the protocol's own token, is reported under staking; every other token is TVL.",
  start: '2026-08-04',
  doublecounted: true,
  robinhood: {
    tvl: (api) => tvl(api, false),
    staking: (api) => tvl(api, true),
  },
}
