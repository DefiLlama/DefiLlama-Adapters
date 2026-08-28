/**
 * ARMSys — Dynamic-Fee Hook for Uniswap v4
 *
 *   Base mainnet:    ETH/USDC v4 pool, ARMSHookV3 (round-30, 2026-04-27).
 *   Robinhood Chain: NVDA/USDG, INTC/USDG and SPCX/USDG v4 pools,
 *                    ARMSHookV3RWA (2026-07-31 / 2026-08-03) — tokenized
 *                    US equities issued on the broker's own chain.
 *
 * Base uses the standard uniV4HookExport helper. That helper resolves a pool's
 * TVL through the Uniswap v4 subgraph and only supports chains present in its
 * graphIds map (base, ethereum). Robinhood Chain has no v4 subgraph — Uniswap's
 * own v4 adapter covers that chain through on-chain Initialize-event scanning —
 * and per-hook TVL cannot be read off the PoolManager singleton balance, since
 * the singleton holds the reserves of every pool on the chain. So the Robinhood
 * side reads the pools directly: liquidity positions minted on the canonical v4
 * PositionManager, converted to underlying amounts with the pool's current
 * price. If a v4 subgraph ships for the chain, this collapses into one more
 * entry in graphIds.
 */

const { uniV4HookExport } = require('../helper/uniswapV4');
const { getLogs } = require('../helper/cache/getLogs');

const HOOK = '0x7fB4846d3987476577319f112731BB04f45880C8'; // Base, round-30

// ─── Robinhood Chain ────────────────────────────────────────────────────
const RH_POOL_MANAGER = '0x8366a39CC670B4001A1121B8F6A443A643e40951';
const RH_POSITION_MANAGER = '0x58daec3116aae6D93017bAAea7749052E8a04fA7';
const RH_HOOK = '0x20f8B7ec9cC3Bb5c739deDB15a8b4275F84B00c8';
const USDG = '0x5fc5360d0400a0fd4f2af552add042d716f1d168';

// One entry per live pool. `slot0` is the PoolManager storage location of the
// pool's slot0, precomputed as keccak256(abi.encode(poolId, uint256(6))).
// SPCX sorts below USDG, so that pool's currency order is reversed.
const RH_POOLS = [
  {
    id: '0x53e74184f024eb01ceb7bbde68866bff3cc3ddf378c78745eb52bdd9ad7bcd91',
    slot0: '0x9c84d52b8bb441beb575d083100f114b0c56b9ce514618366619fcf1f9572272',
    token0: USDG,
    token1: '0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec', // NVDA
  },
  {
    id: '0x0703d548618b02c35d53acc889c1edb792aabccde3217004cd7dabb604fad3bd',
    slot0: '0xc7f8fc209311bad5754f42a62ba9bd9cff4ea8ae6d3e4bad3e693a8fb87a465c',
    token0: USDG,
    token1: '0xc72b96e0e48ecd4dc75e1e45396e26300bc39681', // INTC
  },
  {
    id: '0xdbd476102c84ca90d501b1330b11e9a6c092ab9a811a7f6a45b1d971872fab13',
    slot0: '0x73c3182a3e04b5204c9003d01a04aef154cff075754a41d6a39d64992f01a613',
    token0: '0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea', // SPCX
    token1: USDG,
  },
];
const RH_FROM_BLOCK = 22867792; // 2026-07-30, a day before the first RWA pool

const MODIFY_LIQUIDITY_TOPIC =
  '0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec';
const Q96 = 2n ** 96n;

// slot0 packs sqrtPriceX96 (160) | tick (24) | protocolFee | lpFee
function decodeSlot0(raw) {
  const v = BigInt(raw);
  const sqrtPriceX96 = v & ((1n << 160n) - 1n);
  let tick = Number((v >> 160n) & ((1n << 24n) - 1n));
  if (tick >= 1 << 23) tick -= 1 << 24; // int24 sign extension
  return { sqrtPriceX96, tick };
}

function tickToSqrtPriceX96(tick) {
  return BigInt(Math.floor(Math.pow(1.0001, tick / 2) * 2 ** 96));
}

function positionToAmounts(liquidity, tickLower, tickUpper, tick, sqrtPriceX96) {
  const L = BigInt(liquidity);
  if (L === 0n) return { amount0: 0n, amount1: 0n };
  const sqrtPL = tickToSqrtPriceX96(tickLower);
  const sqrtPU = tickToSqrtPriceX96(tickUpper);
  if (tick < tickLower)
    return { amount0: (L * Q96 * (sqrtPU - sqrtPL)) / (sqrtPU * sqrtPL), amount1: 0n };
  if (tick >= tickUpper)
    return { amount0: 0n, amount1: (L * (sqrtPU - sqrtPL)) / Q96 };
  const sqrtP = sqrtPriceX96 < sqrtPL ? sqrtPL : (sqrtPriceX96 > sqrtPU ? sqrtPU : sqrtPriceX96);
  return {
    amount0: (L * Q96 * (sqrtPU - sqrtP)) / (sqrtPU * sqrtP),
    amount1: (L * (sqrtP - sqrtPL)) / Q96,
  };
}

async function robinhoodTvl(api) {
  for (const pool of RH_POOLS) {
    const slot0Raw = await api.call({
      target: RH_POOL_MANAGER,
      abi: 'function extsload(bytes32) view returns (bytes32)',
      params: pool.slot0,
    });
    const { sqrtPriceX96, tick } = decodeSlot0(slot0Raw);

    // Every (un)mint on this pool emits ModifyLiquidity; `salt` carries the
    // PositionManager tokenId when the position was minted through it.
    const logs = await getLogs({
      api,
      target: RH_POOL_MANAGER,
      eventAbi:
        'event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)',
      topics: [MODIFY_LIQUIDITY_TOPIC, pool.id],
      fromBlock: RH_FROM_BLOCK,
      extraKey: `armsys-rh-${pool.id.slice(2, 10)}`,
    });

    const tokenIds = new Set();
    for (const log of logs) {
      const salt = log.args ? log.args.salt : undefined;
      if (salt === undefined) continue;
      const id = BigInt(salt.toString());
      if (id !== 0n) tokenIds.add(id.toString());
    }

    let amount0 = 0n;
    let amount1 = 0n;
    const calls = [...tokenIds];
    const infos = await api.multiCall({
      target: RH_POSITION_MANAGER,
      abi: 'function getPoolAndPositionInfo(uint256) view returns ((address,address,uint24,int24,address), uint256)',
      calls,
    });
    const liquidities = await api.multiCall({
      target: RH_POSITION_MANAGER,
      abi: 'function getPositionLiquidity(uint256) view returns (uint128)',
      calls,
    });
    for (let i = 0; i < calls.length; i++) {
      const info = infos[i];
      const liquidity = liquidities[i];
      if (!liquidity || liquidity === '0') continue;
      // Defensive: the position must belong to our hook.
      if ((info[0][4] || '').toLowerCase() !== RH_HOOK.toLowerCase()) continue;

      // PositionInfo layout: bit 8..31 tickLower, bit 32..55 tickUpper (int24).
      const packed = BigInt(info[1]);
      let tL = Number((packed >> 8n) & ((1n << 24n) - 1n));
      let tU = Number((packed >> 32n) & ((1n << 24n) - 1n));
      if (tL >= 1 << 23) tL -= 1 << 24;
      if (tU >= 1 << 23) tU -= 1 << 24;

      const a = positionToAmounts(liquidity, tL, tU, tick, sqrtPriceX96);
      amount0 += a.amount0;
      amount1 += a.amount1;
    }

    api.add(pool.token0, amount0.toString());
    api.add(pool.token1, amount1.toString());
  }
}

module.exports = {
  methodology:
    'TVL is the liquidity in ARMSys pools, which are hooks on the Uniswap V4 ' +
    'PoolManager. On Base it is read through the Uniswap v4 subgraph. On ' +
    'Robinhood Chain — three tokenized-equity pools, NVDA/USDG, INTC/USDG and ' +
    'SPCX/USDG — there is no v4 subgraph, so each pool is read on-chain: LP ' +
    'positions minted on the canonical v4 PositionManager are converted to ' +
    "underlying token amounts using the pool's current sqrtPriceX96 and standard " +
    'concentrated-liquidity math.',
  doublecounted: true,
  timetravel: false,
  base: {
    tvl: uniV4HookExport({ hook: HOOK }),
  },
  robinhood: {
    tvl: robinhoodTvl,
  },
};
