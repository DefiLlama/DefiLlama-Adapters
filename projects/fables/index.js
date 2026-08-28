const { addUniV3LikePosition } = require('../helper/unwrapLPs')

const REGISTRY = '0x159a113e012593d9b3cc63ad45e30f0467e13ef3' // FablesPoolRegistry
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap v4 StateView on Robinhood Chain
const MAX_TICK = 887272

const POOLS_ABI = 'function activePools() view returns (tuple(tuple(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks) key, bytes32 id, bool active)[])'
const SLOT0_ABI = 'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const BITMAP_ABI = 'function getTickBitmap(bytes32 poolId, int16 wordPos) view returns (uint256)'
const TICKLIQ_ABI = 'function getTickLiquidity(bytes32 poolId, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet)'

async function tvl(api) {
  // activePools() returns the full PoolKey per pool; the nested tuple[] decodes cleanly (verified live).
  const pools = await api.call({ target: REGISTRY, abi: POOLS_ABI })

  for (const p of pools) {
    const token0 = p.key.currency0
    const token1 = p.key.currency1
    const ts = Number(p.key.tickSpacing)

    const slot0 = await api.call({ target: STATE_VIEW, abi: SLOT0_ABI, params: [p.id] })
    const tick = Number(slot0.tick)

    // Find every initialized tick via the bitmap. compressed = tick / tickSpacing; wordPos = compressed >> 8.
    const minWord = Math.floor(-MAX_TICK / ts) >> 8
    const maxWord = Math.floor(MAX_TICK / ts) >> 8
    const words = []
    for (let w = minWord; w <= maxWord; w++) words.push(w)
    const bitmaps = await api.multiCall({
      target: STATE_VIEW,
      abi: BITMAP_ABI,
      calls: words.map((w) => ({ params: [p.id, w] })),
    })

    const ticks = []
    bitmaps.forEach((bm, i) => {
      const word = BigInt(bm)
      if (word === 0n) return
      for (let bit = 0; bit < 256; bit++) {
        if ((word >> BigInt(bit)) & 1n) ticks.push((words[i] * 256 + bit) * ts)
      }
    })
    ticks.sort((a, b) => a - b)
    if (ticks.length < 2) continue

    const nets = await api.multiCall({
      target: STATE_VIEW,
      abi: TICKLIQ_ABI,
      calls: ticks.map((t) => ({ params: [p.id, t] })),
    })

    let liquidity = 0
    for (let i = 0; i < ticks.length - 1; i++) {
      liquidity += Number(nets[i].liquidityNet)
      if (liquidity <= 0) continue
      addUniV3LikePosition({ api, token0, token1, liquidity, tickLower: ticks[i], tickUpper: ticks[i + 1], tick })
    }
  }
}

module.exports = {
  methodology:
    'Enumerates every Fables pool from the on-chain FablesPoolRegistry (activePools) and sums each v4 pool\'s token reserves, reconstructed from its tick liquidity via Uniswap v4 StateView.',
  doublecounted: true,
  robinhood: { tvl },
}
