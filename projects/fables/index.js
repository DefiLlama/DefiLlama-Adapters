const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const REGISTRY = '0x159a113e012593d9b3cc63ad45e30f0467e13ef3' // FablesPoolRegistry
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap v4 StateView on Robinhood Chain
const MAX_TICK = 887272
const FABLES = '0xb63d07CEf74bE747231d601bb2FAa6B252c68106' // FABLES token
const VE_FABLES = '0xc1d5adc963a57d24adaf63aae1bfbecab95f6edd' // VotingEscrowFF: FABLES locked as veFABLES

const POOLS_ABI = 'function activePools() view returns (tuple(tuple(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks) key, bytes32 id, bool active)[])'
const SLOT0_ABI = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const BITMAP_ABI = 'function getTickBitmap(bytes32 poolId, int16 wordPos) view returns (uint256)'
const TICKLIQ_ABI = 'function getTickLiquidity(bytes32 poolId, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet)'

async function tvl(api) {
  // activePools() returns the full PoolKey per pool; the nested tuple[] decodes cleanly (verified live).
  const pools = await api.call({ target: REGISTRY, abi: POOLS_ABI })

  // every step is one multicall across all pools, instead of one set of calls per pool
  const slot0s = await api.multiCall({ target: STATE_VIEW, abi: SLOT0_ABI, calls: pools.map((p) => ({ params: [p.id] })) })

  // Find every initialized tick via the bitmap. compressed = tick / tickSpacing; wordPos = compressed >> 8.
  const wordCalls = []
  pools.forEach((p, poolIdx) => {
    const ts = Number(p.key.tickSpacing)
    const minWord = Math.floor(-MAX_TICK / ts) >> 8
    const maxWord = Math.floor(MAX_TICK / ts) >> 8
    for (let w = minWord; w <= maxWord; w++) wordCalls.push({ poolIdx, word: w, ts })
  })
  const bitmaps = await api.multiCall({
    target: STATE_VIEW,
    abi: BITMAP_ABI,
    calls: wordCalls.map(({ poolIdx, word }) => ({ params: [pools[poolIdx].id, word] })),
    chunkSize: 1000, // a bitmap word is a single storage read, so bigger chunks than the default are cheap
  })

  const poolTicks = pools.map(() => [])
  bitmaps.forEach((bm, i) => {
    const word = BigInt(bm)
    if (word === 0n) return
    const { poolIdx, word: wordPos, ts } = wordCalls[i]
    for (let bit = 0; bit < 256; bit++) {
      if ((word >> BigInt(bit)) & 1n) poolTicks[poolIdx].push((wordPos * 256 + bit) * ts)
    }
  })

  const tickCalls = []
  poolTicks.forEach((ticks, poolIdx) => {
    ticks.sort((a, b) => a - b)
    if (ticks.length < 2) return
    ticks.forEach((t) => tickCalls.push({ poolIdx, params: [pools[poolIdx].id, t] }))
  })
  const nets = await api.multiCall({
    target: STATE_VIEW,
    abi: TICKLIQ_ABI,
    calls: tickCalls.map(({ params }) => ({ params })),
  })
  const poolNets = pools.map(() => [])
  nets.forEach((net, i) => poolNets[tickCalls[i].poolIdx].push(net))

  pools.forEach((p, poolIdx) => {
    const ticks = poolTicks[poolIdx]
    if (ticks.length < 2) return
    const token0 = p.key.currency0
    const token1 = p.key.currency1
    const tick = Number(slot0s[poolIdx].tick)

    let liquidity = 0
    for (let i = 0; i < ticks.length - 1; i++) {
      liquidity += Number(poolNets[poolIdx][i].liquidityNet)
      if (liquidity <= 0) continue
      addUniV3LikePosition({ api, token0, token1, liquidity, tickLower: ticks[i], tickUpper: ticks[i + 1], tick })
    }
  })
}

module.exports = {
  methodology:
    'TVL enumerates every Fables pool from the on-chain FablesPoolRegistry (activePools) and sums each v4 pool\'s token reserves, reconstructed from its tick liquidity via Uniswap v4 StateView. Staking counts the FABLES locked in the VotingEscrowFF contract as veFABLES.',
  doublecounted: true,
  robinhood: {
    tvl,
    staking: staking(VE_FABLES, FABLES),
  },
}
