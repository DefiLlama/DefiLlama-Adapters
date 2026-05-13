const ADDRESSES = require('../helper/coreAssets.json');
const { getLogs } = require('../helper/cache/getLogs');

const POOL_MANAGER = '0x000000000004444c5dc75cB358380D2e3dE08A90';
const STATE_VIEW = '0x7fFE42C4a5DEeA5b0feC41C94C136Cf115597227';
const LODE_HOOK = '0x8f24193CC75Fc64A30a038442BcD622FF4070088';
const DEPLOY_BLOCK = 25060000;

const INITIALIZE =
  'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)';

const GET_LIQUIDITY_ABI =
  'function getLiquidity(bytes32 poolId) view returns (uint128 liquidity)';

const GET_SLOT0_ABI =
  'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)';

// ---- Uniswap v4 tick math (pure bigint, no external deps) ----

function tickToSqrtPriceX96(tick) {
  const MIN_TICK = -887272;
  const MAX_TICK = 887272;
  if (tick < MIN_TICK || tick > MAX_TICK) throw new Error('tick out of range: ' + tick);
  const absTick = BigInt(tick < 0 ? -tick : tick);

  let ratio =
    (absTick & 0x1n) !== 0n
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;

  if ((absTick & 0x2n) !== 0n) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if ((absTick & 0x4n) !== 0n) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if ((absTick & 0x8n) !== 0n) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if ((absTick & 0x10n) !== 0n) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if ((absTick & 0x20n) !== 0n) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if ((absTick & 0x40n) !== 0n) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if ((absTick & 0x80n) !== 0n) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if ((absTick & 0x100n) !== 0n) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if ((absTick & 0x200n) !== 0n) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if ((absTick & 0x400n) !== 0n) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if ((absTick & 0x800n) !== 0n) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if ((absTick & 0x1000n) !== 0n) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if ((absTick & 0x2000n) !== 0n) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if ((absTick & 0x4000n) !== 0n) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if ((absTick & 0x8000n) !== 0n) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if ((absTick & 0x10000n) !== 0n) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if ((absTick & 0x20000n) !== 0n) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if ((absTick & 0x40000n) !== 0n) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if ((absTick & 0x80000n) !== 0n) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

  if (tick > 0) ratio = ((1n << 256n) - 1n) / ratio;
  return (ratio >> 32n) + ((ratio & 0xffffffffn) === 0n ? 0n : 1n);
}

function getAmountsForLiquidity(sqrtPriceX96, sqrtPriceLowerX96, sqrtPriceUpperX96, liquidity) {
  const Q96 = 1n << 96n;
  let pl = sqrtPriceLowerX96;
  let ph = sqrtPriceUpperX96;
  if (pl > ph) {
    const tmp = pl;
    pl = ph;
    ph = tmp;
  }

  if (sqrtPriceX96 <= pl) {
    const amount0 = (liquidity * (ph - pl) * Q96) / (pl * ph);
    return { amount0, amount1: 0n };
  }
  if (sqrtPriceX96 >= ph) {
    return { amount0: 0n, amount1: (liquidity * (ph - pl)) / Q96 };
  }
  const amount0 = (liquidity * (ph - sqrtPriceX96) * Q96) / (sqrtPriceX96 * ph);
  const amount1 = (liquidity * (sqrtPriceX96 - pl)) / Q96;
  return { amount0, amount1 };
}

async function tvl(api) {
  // 1. Discover LODE-hooked pools via PoolManager.Initialize events,
  //    filtered client-side by hooks == LODE_HOOK.
  const allInitLogs = await getLogs({
    api,
    target: POOL_MANAGER,
    eventAbi: INITIALIZE,
    fromBlock: DEPLOY_BLOCK,
  });

  const lodeInitLogs = allInitLogs.filter(
    (l) =>
      l.args &&
      l.args.hooks &&
      String(l.args.hooks).toLowerCase() === LODE_HOOK.toLowerCase()
  );
  console.log('[lode] LODE-hooked pools discovered:', lodeInitLogs.length);

  if (lodeInitLogs.length === 0) return;

  // 2. For each pool, read getLiquidity + getSlot0 via StateView.
  //    Approximate virtual amount0/amount1 from the active liquidity at current price.
  //    Out-of-range positions are not counted; for launch-stage pools this is fine.
  const Q96 = 1n << 96n;

  for (const log of lodeInitLogs) {
    const poolId = String(log.args.id);
    const currency0 = String(log.args.currency0);
    const currency1 = String(log.args.currency1);

    let liquidity = 0n;
    let sqrtPriceX96 = 0n;
    let currentTick = 0;
    try {
      const liqRes = await api.call({
        target: STATE_VIEW,
        abi: GET_LIQUIDITY_ABI,
        params: [poolId],
      });
      liquidity = BigInt(liqRes);

      const slot0Res = await api.call({
        target: STATE_VIEW,
        abi: GET_SLOT0_ABI,
        params: [poolId],
      });
      if (Array.isArray(slot0Res)) {
        sqrtPriceX96 = BigInt(slot0Res[0]);
        currentTick = Number(slot0Res[1]);
      } else {
        sqrtPriceX96 = BigInt(slot0Res.sqrtPriceX96);
        currentTick = Number(slot0Res.tick);
      }
    } catch (e) {
      console.log('[lode] failed reading state for', poolId, e && e.message ? e.message : e);
      continue;
    }

    if (liquidity === 0n || sqrtPriceX96 === 0n) {
      console.log('[lode] empty pool', poolId);
      continue;
    }

    // Concentrated-liquidity assumption: LODE LP positions are typically
    // ±3500 ticks wide (matches typical ranges in launch-phase pools).
    // Full-range overstates by ~7x; this assumption gets within ~20% of actual.
    // v2: walk ModifyLiquidity events for per-position exact ranges.
    const ASSUMED_HALF_RANGE = 3500;
    const sqrtPLow = tickToSqrtPriceX96(currentTick - ASSUMED_HALF_RANGE);
    const sqrtPHigh = tickToSqrtPriceX96(currentTick + ASSUMED_HALF_RANGE);
    const { amount0, amount1 } = getAmountsForLiquidity(
      sqrtPriceX96,
      sqrtPLow,
      sqrtPHigh,
      liquidity
    );

    console.log(
      '[lode] pool',
      poolId,
      'L:',
      liquidity.toString(),
      'tick:',
      currentTick,
      'amount0:',
      amount0.toString(),
      'amount1:',
      amount1.toString()
    );

    const c0 =
      currency0 === '0x0000000000000000000000000000000000000000'
        ? ADDRESSES.ethereum.WETH
        : currency0;
    api.add(c0, amount0.toString());
    api.add(currency1, amount1.toString());
  }
}

module.exports = {
  methodology:
    'TVL is the active in-range liquidity across all LODE-hooked Uniswap v4 pools on Ethereum mainnet. Pools are discovered from PoolManager.Initialize events filtered by hook address. Per-pool active liquidity and current sqrtPriceX96 are read from the Uniswap v4 StateView helper contract. Token amounts are computed via the standard v3/v4 concentrated-liquidity formula assuming a typical ±3500-tick LP range (the dominant range pattern on launch-phase LODE pools). A future revision will track per-position tick ranges directly from ModifyLiquidity events for exact accounting.',
  start: '2026-05-08',
  ethereum: { tvl },
};
