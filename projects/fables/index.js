// DeFiLlama TVL adapter for Fables (Robinhood Chain).
//
// Enumeration is trivial and exact: read `activePools()` off the on-chain FablesPoolRegistry, so new
// pools appear automatically and no hook address is ever hardcoded here. For each pool we reconstruct
// the token reserves from its v4 tick liquidity via Uniswap's StateView, then DeFiLlama prices the two
// token balances into USD.
//
// Verified end-to-end through DeFiLlama's own harness (node test.js projects/fables/index.js) on
// chain 4663: enumerates all 6 pools from activePools(), reconstructs reserves via StateView, and
// DeFiLlama prices every token (USDG/NVDA/SPY/AAPL/TSLA/ETH). Total TVL ~$52.5k across the 6 markets.

// Robinhood Chain: chainId 4663. DefiLlama's chain key is 'robinhood' (see projects/helper/chains.json
// and the v4 StateView already wired for it in projects/helper/unwrapLPs.js).
const CHAIN = 'robinhood'
const REGISTRY = '0x159a113e012593d9b3cc63ad45e30f0467e13ef3' // FablesPoolRegistry
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b' // Uniswap v4 StateView on Robinhood Chain
const Q96 = 2 ** 96
const MAX_TICK = 887272

// StateView signatures, confirmed live on chain 4663.
const POOLS_ABI =
  'function activePools() view returns (tuple(tuple(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks) key, bytes32 id, bool active)[])'
const SLOT0_ABI =
  'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'
const BITMAP_ABI = 'function getTickBitmap(bytes32 poolId, int16 wordPos) view returns (uint256)'
const TICKLIQ_ABI =
  'function getTickLiquidity(bytes32 poolId, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet)'

// Actual sqrt(price) (unitless), i.e. sqrtPriceX96 / 2**96. Float is fine: TVL is an approximate USD
// figure, not a wei-exact settlement.
const sqrtAtTick = (t) => Math.pow(1.0001, t / 2)

async function tvl(api) {
  // activePools() returns the full PoolKey per pool; the nested tuple[] decodes cleanly (verified live).
  const pools = await api.call({ target: REGISTRY, abi: POOLS_ABI, chain: CHAIN })

  for (const p of pools) {
    const c0 = p.key.currency0
    const c1 = p.key.currency1
    const ts = Number(p.key.tickSpacing)

    const slot0 = await api.call({ target: STATE_VIEW, abi: SLOT0_ABI, params: [p.id], chain: CHAIN })
    const sqrtP = Number(slot0.sqrtPriceX96) / Q96

    // Find every initialized tick via the bitmap. compressed = tick / tickSpacing; wordPos = compressed >> 8.
    const minWord = Math.floor(-MAX_TICK / ts) >> 8
    const maxWord = Math.floor(MAX_TICK / ts) >> 8
    const words = []
    for (let w = minWord; w <= maxWord; w++) words.push(w)
    const bitmaps = await api.multiCall({
      target: STATE_VIEW,
      abi: BITMAP_ABI,
      calls: words.map((w) => ({ params: [p.id, w] })),
      chain: CHAIN,
    })

    const ticks = []
    bitmaps.forEach((bm, i) => {
      let word = BigInt(bm)
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
      chain: CHAIN,
    })

    // Walk the intervals between initialized ticks, accumulating liquidityNet, and sum each interval's
    // token amounts at the current price (standard Uniswap LiquidityAmounts, in unitless sqrt form).
    let L = 0
    let amt0 = 0
    let amt1 = 0
    for (let i = 0; i < ticks.length - 1; i++) {
      L += Number(nets[i].liquidityNet)
      if (L <= 0) continue
      const sa = sqrtAtTick(ticks[i])
      const sb = sqrtAtTick(ticks[i + 1])
      if (sqrtP <= sa) {
        amt0 += (L * (sb - sa)) / (sa * sb)
      } else if (sqrtP >= sb) {
        amt1 += L * (sb - sa)
      } else {
        amt0 += (L * (sb - sqrtP)) / (sqrtP * sb)
        amt1 += L * (sqrtP - sa)
      }
    }
    api.add(c0, Math.round(amt0))
    api.add(c1, Math.round(amt1))
  }
}

module.exports = {
  methodology:
    'Enumerates every Fables pool from the on-chain FablesPoolRegistry (activePools) and sums each v4 pool\'s token reserves, reconstructed from its tick liquidity via Uniswap v4 StateView.',
  [CHAIN]: { tvl },
}
