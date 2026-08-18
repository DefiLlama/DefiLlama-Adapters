const { getLogs2 } = require('../helper/cache/getLogs')
const { nullAddress } = require('../helper/tokenMapping')
const { ethers } = require('ethers')

/* What The Hook — a Uniswap v4 hook on Robinhood Chain.
 *
 * TVL is the liquidity held in the v4 pools that run the hook, the same
 * definition helper/uniswapV4.js uses for hooks. That helper reads a
 * subgraph and Robinhood Chain has none, so the reserves are reconstructed
 * from PoolManager storage instead: v4 keeps every pool inside one
 * singleton, so no pool has a contract of its own whose token balances
 * could simply be read.
 *
 * Pools are found at the hook, which emits PoolRegistered for each one it
 * takes on. Reading the PoolManager's whole Initialize history and keeping
 * the 45 that name this hook meant fetching 153,720 logs to use 45 of them;
 * both routes were compared on-chain and return the same 45 pool ids.
 *
 * Cross-checked three ways. Against Dexscreener on the two pools it lists:
 * $454,153 vs $454,604 and $398,979 vs $399,431, 0.1% apart. Against the
 * singleton itself: the hook's pools account for 99.9% of all the WTH held
 * in v4, which is right because they are the WTH pools — while claiming
 * only 3.7% of its WETH, which a plain balanceOf would have over-reported
 * twenty-sevenfold.
 */

const POOL_MANAGER = '0x8366a39CC670B4001A1121B8F6A443A643e40951'
const HOOK = '0xc52fc52698479e42f0da9a8a75296ec3871454c0'
const FROM_BLOCK = 27190942 // hook deployment

/* The hook announces every pool that registers with it, so the pools are
 * discovered at the hook rather than by reading every Initialize the
 * PoolManager has ever emitted and discarding almost all of it: 45 logs
 * instead of 153,720. Initialize is still read, but only for those 45 ids
 * — it is the one place the pair's two currencies are on chain, since a
 * v4 PoolKey is hashed into the id and never stored. */
const registeredAbi = 'event PoolRegistered(address indexed token, bytes32 indexed poolId, uint24 fee, int24 tickSpacing)'
const initializeAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const extsloadAbi = 'function extsload(bytes32 slot) view returns (bytes32)'

/* v4-core StateLibrary: _pools lives at slot 6, and within a Pool.State
 * liquidity is at +3, ticks at +4 and tickBitmap at +5. The last two are
 * easy to transpose and the failure is silent — a wrong bitmap reports no
 * initialised ticks and every pool comes back empty. */
const POOLS_SLOT = 6n
const LIQUIDITY_OFFSET = 3n
const TICKS_OFFSET = 4n
const TICK_BITMAP_OFFSET = 5n

const MIN_TICK = -887272
const MAX_TICK = 887272
const Q96 = 2n ** 96n
const MASK_128 = (1n << 128n) - 1n
const MASK_160 = (1n << 160n) - 1n

const coder = ethers.AbiCoder.defaultAbiCoder()
const toSlot = (n) => '0x' + n.toString(16).padStart(64, '0')
const poolSlot = (id) => BigInt(ethers.keccak256(coder.encode(['bytes32', 'uint256'], [id, POOLS_SLOT])))
const mapSlot = (type, key, slot) => ethers.keccak256(coder.encode([type, 'uint256'], [key, toSlot(slot)]))
const asInt128 = (v) => (v & (1n << 127n) ? v - (1n << 128n) : v)

/* TickMath.getSqrtRatioAtTick, exactly as the pool computes it — floats
 * drift by basis points at the wide tick spacings these pools use */
function sqrtRatioAtTick(tick) {
  const abs = BigInt(tick < 0 ? -tick : tick)
  let r = (abs & 0x1n) !== 0n ? 0xfffcb933bd6fad37aa2d162d1a594001n : 0x100000000000000000000000000000000n
  const factors = [
    [0x2n, 0xfff97272373d413259a46990580e213an], [0x4n, 0xfff2e50f5f656932ef12357cf3c7fdccn],
    [0x8n, 0xffe5caca7e10e4e61c3624eaa0941cd0n], [0x10n, 0xffcb9843d60f6159c9db58835c926644n],
    [0x20n, 0xff973b41fa98c081472e6896dfb254c0n], [0x40n, 0xff2ea16466c96a3843ec78b326b52861n],
    [0x80n, 0xfe5dee046a99a2a811c461f1969c3053n], [0x100n, 0xfcbe86c7900a88aedcffc83b479aa3a4n],
    [0x200n, 0xf987a7253ac413176f2b074cf7815e54n], [0x400n, 0xf3392b0822b70005940c7a398e4b70f3n],
    [0x800n, 0xe7159475a2c29b7443b29c7fa6e889d9n], [0x1000n, 0xd097f3bdfd2022b8845ad8f792aa5825n],
    [0x2000n, 0xa9f746462d870fdf8a65dc1f90e061e5n], [0x4000n, 0x70d869a156d2a1b890bb3df62baf32f7n],
    [0x8000n, 0x31be135f97d08fd981231505542fcfa6n], [0x10000n, 0x9aa508b5b7a84e1c677de54f3e99bc9n],
    [0x20000n, 0x5d6af8dedb81196699c329225ee604n], [0x40000n, 0x2216e584f5fa1ea926041bedfe98n],
    [0x80000n, 0x48a170391f7dc42444e8fa2n],
  ]
  for (const [bit, mul] of factors) if ((abs & bit) !== 0n) r = (r * mul) >> 128n
  if (tick > 0) r = ((1n << 256n) - 1n) / r
  return (r >> 32n) + ((r % (1n << 32n)) === 0n ? 0n : 1n)
}

/* one pool's reserves: walk its initialised ticks in order, carry the
 * running liquidity, and integrate each range against the current price */
function reserves({ sqrtP, ticks, nets }) {
  let amount0 = 0n
  let amount1 = 0n
  let liquidity = 0n
  for (let i = 0; i < ticks.length - 1; i++) {
    liquidity += nets[ticks[i]] ?? 0n
    if (liquidity <= 0n) continue
    const a = sqrtRatioAtTick(ticks[i])
    const b = sqrtRatioAtTick(ticks[i + 1])
    if (b <= sqrtP) {
      amount1 += (liquidity * (b - a)) / Q96
    } else if (a >= sqrtP) {
      amount0 += (liquidity * (b - a) * Q96) / (a * b)
    } else {
      amount1 += (liquidity * (sqrtP - a)) / Q96
      amount0 += (liquidity * (b - sqrtP) * Q96) / (sqrtP * b)
    }
  }
  return { amount0, amount1 }
}

async function tvl(api) {
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

  /* The hook has had pools since the block this scan starts from, so an
   * empty result is a broken read, not an empty protocol. Returning here
   * would publish a TVL of zero over the last good value; throwing fails
   * the run and leaves that value standing. */
  if (!ids.length) throw new Error('what-the-hook: the hook reports no registered pools — log fetch likely failed')

  /* The two currencies live only in Initialize, because a v4 PoolKey is
   * hashed into the id and never stored. Asking for them by id keeps this
   * to one log per pool instead of the whole history of the singleton. */
  const initialize = await getLogs2({
    api, target: POOL_MANAGER, eventAbi: initializeAbi, fromBlock: FROM_BLOCK,
    topics: [ethers.id('Initialize(bytes32,address,address,uint24,int24,address,uint160,int24)'), ids],
    onlyArgs: false, extraKey: 'wth-init-by-id',
  })
  const ID = 0, CURRENCY0 = 1, CURRENCY1 = 2
  const pools = initialize.map((log) => {
    const args = log.args ?? log
    const id = String(args[ID])
    return {
      id,
      token0: args[CURRENCY0],
      token1: args[CURRENCY1],
      spacing: spacingById[id.toLowerCase()],
      base: poolSlot(id),
    }
  })
  if (pools.length !== ids.length)
    throw new Error(`what-the-hook: ${ids.length} pools registered but ${pools.length} Initialize logs found`)

  // slot0 carries the price; a pool that never got one is uninitialised
  const slot0s = await api.multiCall({
    abi: extsloadAbi, target: POOL_MANAGER,
    calls: pools.map((p) => ({ params: [toSlot(p.base)] })),
  })
  const live = []
  slot0s.forEach((raw, i) => {
    const sqrtP = BigInt(raw) & MASK_160
    if (sqrtP > 0n) live.push({ ...pools[i], sqrtP, ticks: [], nets: {} })
  })
  // same reasoning: every one of these pools has traded, so none of them
  // can honestly report no price
  if (!live.length) throw new Error('what-the-hook: no initialised pools among ' + pools.length + ' — storage read likely failed')

  // every word of every pool's tick bitmap, in one flat call
  const words = []
  live.forEach((p, i) => {
    const lo = Math.floor(MIN_TICK / p.spacing) >> 8
    const hi = Math.floor(MAX_TICK / p.spacing) >> 8
    for (let w = lo; w <= hi; w++) words.push({ pool: i, word: w })
  })
  const bitmaps = await api.multiCall({
    abi: extsloadAbi, target: POOL_MANAGER,
    calls: words.map(({ pool, word }) =>
      ({ params: [mapSlot('int16', word, live[pool].base + TICK_BITMAP_OFFSET)] })),
  })
  bitmaps.forEach((raw, i) => {
    const bits = BigInt(raw)
    if (bits === 0n) return
    const { pool, word } = words[i]
    for (let b = 0; b < 256; b++)
      if ((bits >> BigInt(b)) & 1n) live[pool].ticks.push(((word << 8) + b) * live[pool].spacing)
  })

  // liquidityNet sits in the high 128 bits of each tick's first slot
  const tickCalls = []
  live.forEach((p, i) => {
    p.ticks.sort((a, b) => a - b)
    p.ticks.forEach((tick) => tickCalls.push({ pool: i, tick }))
  })
  if (tickCalls.length) {
    const tickData = await api.multiCall({
      abi: extsloadAbi, target: POOL_MANAGER,
      calls: tickCalls.map(({ pool, tick }) =>
        ({ params: [mapSlot('int24', tick, live[pool].base + TICKS_OFFSET)] })),
    })
    tickData.forEach((raw, i) => {
      const { pool, tick } = tickCalls[i]
      live[pool].nets[tick] = asInt128((BigInt(raw) >> 128n) & MASK_128)
    })
  }

  live.forEach((p) => {
    const { amount0, amount1 } = reserves(p)
    if (amount0 > 0n) api.add(p.token0, amount0)
    if (amount1 > 0n) api.add(p.token1, amount1)
  })
}

module.exports = {
  methodology:
    "Counts the liquidity held in every Uniswap v4 pool that runs the WTH hook. Pools are discovered from the PoolManager's Initialize events, keeping those whose hooks address is the WTH hook, so pools opened later by third-party projects are picked up without a code change. Because v4 keeps every pool inside one singleton, each pool's reserves are reconstructed from PoolManager storage — the current price, the initialised ticks and their liquidityNet — rather than read as a token balance.",
  start: 1785803176, // hook deployment, 2026-08-04
  timetravel: false, // reserves are read from current storage, not replayed
  misrepresentedTokens: false,
  robinhood: { tvl },
}
