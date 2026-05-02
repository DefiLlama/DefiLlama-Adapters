const { getLogs2 } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/tokenMapping");

// Tickr — Non-Fungible Ticker launchpad on Uniswap v4 (Ethereum mainnet).
//
// Each launched ERC-20 deploys its own ETH/Token v4 pool, seeds the pool with
// the entire 1B supply, and burns the LP NFT to 0xdEaD in the same tx. The
// liquidity therefore stays in the v4 PoolManager forever — the only path
// for tokens or ETH to leave a pool is via a swap.
//
// Because v4 uses a singleton PoolManager that holds liquidity for every
// pool on the chain, naive `balanceOf(PoolManager, token)` accounting would
// over-count (other v4 pools may also touch the same token, and the native
// ETH balance is shared). We compute per-pool reserves directly from each
// pool's state, isolating Tickr's contribution exactly.
//
// Source of pool universe — Tickr factory's `LiquidityProvided` event. The
// LP is burned at deploy time, so `liquidity` from the event is constant
// for the life of the pool. Current `sqrtPriceX96` is read from Uniswap's
// StateView lens; reserves come from standard Uniswap v3/v4 LP math.
const config = {
  ethereum: {
    factory:   "0xdb20fb8bEF846c72D0E308bA6293CEF09fB02e0F", // Tickr factory
    stateView: "0x7fFE42C4a5DEeA5b0feC41C94C136Cf115597227", // v4 mainnet lens
    fromBlock: 24994342,                                      // factory deploy block
  },
};

const liquidityProvidedAbi =
  "event LiquidityProvided(address indexed tokenAddress, bytes32 indexed poolId, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, uint256 amount1, uint128 liquidity)";

const slot0Abi =
  "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)";

const Q96 = 1n << 96n;
const MAX_UINT256 = (1n << 256n) - 1n;

// Uniswap v3/v4 TickMath.getSqrtRatioAtTick — direct port. Returns the price
// at the given tick as Q64.96.
function getSqrtRatioAtTick(tick) {
  const absTick = tick < 0 ? BigInt(-tick) : BigInt(tick);
  if (absTick > 887272n) throw new Error("Tick out of range: " + tick);

  let ratio =
    (absTick & 0x1n) !== 0n
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;

  if ((absTick & 0x2n)     !== 0n) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if ((absTick & 0x4n)     !== 0n) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if ((absTick & 0x8n)     !== 0n) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if ((absTick & 0x10n)    !== 0n) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if ((absTick & 0x20n)    !== 0n) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if ((absTick & 0x40n)    !== 0n) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if ((absTick & 0x80n)    !== 0n) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if ((absTick & 0x100n)   !== 0n) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if ((absTick & 0x200n)   !== 0n) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if ((absTick & 0x400n)   !== 0n) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if ((absTick & 0x800n)   !== 0n) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if ((absTick & 0x1000n)  !== 0n) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if ((absTick & 0x2000n)  !== 0n) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if ((absTick & 0x4000n)  !== 0n) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if ((absTick & 0x8000n)  !== 0n) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if ((absTick & 0x10000n) !== 0n) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if ((absTick & 0x20000n) !== 0n) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n)  >> 128n;
  if ((absTick & 0x40000n) !== 0n) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n)    >> 128n;
  if ((absTick & 0x80000n) !== 0n) ratio = (ratio * 0x48a170391f7dc42444e8fa2n)         >> 128n;

  if (tick > 0) ratio = MAX_UINT256 / ratio;

  // Q128.128 → Q64.96 (sqrtPriceX96).  Round up if there is a remainder.
  const remainder = ratio % (1n << 32n);
  return (ratio >> 32n) + (remainder === 0n ? 0n : 1n);
}

// v3/v4 LP math: given liquidity L, current sqrtP, and the position's bounds
// [tickLower, tickUpper], return the (amount0, amount1) backing the position.
// Current price is clamped into [sqrtA, sqrtB] — outside the range a position
// is single-sided.
function reservesFromState(liquidity, sqrtP, tickLower, tickUpper) {
  if (liquidity === 0n) return { amount0: 0n, amount1: 0n };
  const sqrtA = getSqrtRatioAtTick(tickLower);
  const sqrtB = getSqrtRatioAtTick(tickUpper);
  const lo = sqrtA < sqrtB ? sqrtA : sqrtB;
  const hi = sqrtA < sqrtB ? sqrtB : sqrtA;
  const sqrt = sqrtP < lo ? lo : sqrtP > hi ? hi : sqrtP;

  // amount0 = (L << 96) * (sqrtB - sqrt) / (sqrt * sqrtB)
  const amount0 =
    sqrt < hi
      ? ((liquidity << 96n) * (hi - sqrt)) / (sqrt * hi)
      : 0n;

  // amount1 = L * (sqrt - sqrtA) >> 96
  const amount1 = sqrt > lo ? (liquidity * (sqrt - lo)) >> 96n : 0n;

  return { amount0, amount1 };
}

async function tvl(api) {
  const { factory, stateView, fromBlock } = config[api.chain];

  // 1) Pull every Tickr LiquidityProvided log — gives us the full pool set
  //    plus the immutable bounds + liquidity for each one.
  const logs = await getLogs2({
    api,
    target: factory,
    eventAbi: liquidityProvidedAbi,
    fromBlock,
  });

  if (logs.length === 0) return;

  // 2) Read current sqrtPriceX96 for each pool from the v4 StateView lens.
  const slot0s = await api.multiCall({
    abi: slot0Abi,
    target: stateView,
    calls: logs.map((l) => ({ params: [l.poolId] })),
    permitFailure: true,
  });

  // 3) Compute and accumulate per-pool reserves.
  for (let i = 0; i < logs.length; i++) {
    const slot0 = slot0s[i];
    if (!slot0 || !slot0.sqrtPriceX96) continue;

    const liquidity = BigInt(logs[i].liquidity);
    const sqrtP     = BigInt(slot0.sqrtPriceX96);
    const tickLower = Number(logs[i].tickLower);
    const tickUpper = Number(logs[i].tickUpper);

    const { amount0, amount1 } = reservesFromState(liquidity, sqrtP, tickLower, tickUpper);

    // currency0 is ETH on every Tickr pool; currency1 is the launched token.
    if (amount0 > 0n) api.add(nullAddress,             amount0.toString());
    if (amount1 > 0n) api.add(logs[i].tokenAddress,    amount1.toString());
  }
}

module.exports = {
  methodology:
    "Tickr deploys ERC-20 tokens that each receive a dedicated Uniswap v4 ETH/Token pool, seeded with the entire 1B supply at launch and with the LP NFT burned to 0xdead in the same transaction — liquidity is therefore locked permanently and only exits via swaps. TVL is computed by scanning every LiquidityProvided event from the Tickr factory (which already filters to Tickr pools and emits the burned position's tickLower, tickUpper and liquidity), reading the current sqrtPriceX96 for each pool from the Uniswap v4 StateView lens, and applying the standard v3/v4 LP-reserve math to derive each pool's exact ETH and token reserves. Per-pool isolation avoids the singleton-PoolManager over-counting that a naive balanceOf approach would suffer from.",
  start: 24994342,
  ethereum: { tvl },
};
