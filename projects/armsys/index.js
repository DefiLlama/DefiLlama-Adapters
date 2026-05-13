/**
 * ARMSys — Dynamic-Fee Hook for Uniswap v4 on Base
 *
 *   Base mainnet: ETH/USDC v4 pool, ARMSHookV3 (round-30, 2026-04-27).
 *                 Regime-aware dynamic fees + retail/MEV segmentation
 *                 via on-chain BNS-style volatility classifier.
 *
 * --- v4 TVL methodology -------------------------------------------------
 * Uniswap v4 stores all pool reserves inside the singleton PoolManager
 * contract; the hook itself holds no underlying tokens (it only mints
 * 6909 protocol-fee claim tokens, which are claims on PoolManager
 * inventory and would double-count if added to TVL). Hence direct
 * sumTokens on the hook address returns zero.
 *
 * Instead, this adapter walks every LP-position NFT minted on the
 * canonical Uniswap V4 PositionManager since our deploy block, filters
 * to those whose PoolKey points at our hook, and converts each
 * position's (liquidity, tickLower, tickUpper) plus the pool's current
 * sqrtPriceX96 into amount0 + amount1 via standard concentrated-
 * liquidity math (Uniswap v3 SDK formulas). Sum across all positions =
 * total TVL locked in the pool.
 *
 * currency0 of this pool is native ETH (address(0)); we report it as
 * WETH on Base for DefiLlama pricing (treated 1:1 with native ETH).
 */

const { default: BigNumber } = require('bignumber.js');
const { getLogs } = require('../helper/cache/getLogs');

// ─── Addresses ──────────────────────────────────────────────────────────
const POOL_MANAGER = '0x498581fF718922c3f8e6A244956aF099B2652b2b';
const POSITION_MANAGER = '0x7C5f5A4bBd8fD63184577525326123B519429bDc';
const HOOK = '0x7fB4846d3987476577319f112731BB04f45880C8'; // round-30
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const WETH = '0x4200000000000000000000000000000000000006';
const POOL_ID = '0x088b6b69cbcaf84dae02a28dc7b62912ec105b6970d1ab7b985e4e50b6088ccd';
const DEPLOY_BLOCK = 45264092;
// Pre-computed: keccak256(POOL_ID . slot=6) — pool slot0 storage location.
const POOL_SLOT0_STORAGE = '0x74e4f04761ad700adf4ec7a97fbb2eeb13b0fb6cb6d86b1ef6b20750527b7dc6';

const Q96 = new BigNumber(2).pow(96);

// ─── Slot0 decode (sqrtPriceX96 | tick | protocolFee | lpFee) ──────────
function decodeSlot0(raw) {
  const v = new BigNumber(raw);
  const MASK_160 = new BigNumber(2).pow(160).minus(1);
  const MASK_24  = new BigNumber(2).pow(24).minus(1);
  const sqrtPriceX96 = v.mod(MASK_160.plus(1));
  let tick = v.div(new BigNumber(2).pow(160)).integerValue(BigNumber.ROUND_FLOOR).mod(MASK_24.plus(1)).toNumber();
  if (tick >= (1 << 23)) tick -= (1 << 24); // int24 sign extension
  return { sqrtPriceX96, tick };
}

// ─── tick → sqrtPriceX96 (Uniswap formula) ─────────────────────────────
function tickToSqrtPriceX96(tick) {
  return new BigNumber(Math.pow(1.0001, tick / 2)).multipliedBy(Q96);
}

// ─── Concentrated-liquidity amount math ────────────────────────────────
function positionToAmounts(liquidity, tickLower, tickUpper, currentTick, sqrtPriceX96) {
  const L = new BigNumber(liquidity);
  const sqrtPL = tickToSqrtPriceX96(tickLower);
  const sqrtPU = tickToSqrtPriceX96(tickUpper);
  const sqrtP  = new BigNumber(sqrtPriceX96);
  let amount0 = new BigNumber(0);
  let amount1 = new BigNumber(0);
  if (currentTick < tickLower) {
    amount0 = L.multipliedBy(Q96).multipliedBy(sqrtPU.minus(sqrtPL)).div(sqrtPU.multipliedBy(sqrtPL));
  } else if (currentTick > tickUpper) {
    amount1 = L.multipliedBy(sqrtPU.minus(sqrtPL)).div(Q96);
  } else {
    amount0 = L.multipliedBy(Q96).multipliedBy(sqrtPU.minus(sqrtP)).div(sqrtPU.multipliedBy(sqrtP));
    amount1 = L.multipliedBy(sqrtP.minus(sqrtPL)).div(Q96);
  }
  return {
    amount0: amount0.integerValue(BigNumber.ROUND_FLOOR),
    amount1: amount1.integerValue(BigNumber.ROUND_FLOOR),
  };
}

// ─── Base TVL adapter ───────────────────────────────────────────────────
async function tvl(api) {
  // 1. Read pool slot0 (sqrtPriceX96 + tick) via extsload on PoolManager.
  const slot0Raw = await api.call({
    target: POOL_MANAGER,
    abi: 'function extsload(bytes32) view returns (bytes32)',
    params: POOL_SLOT0_STORAGE,
  });
  const { sqrtPriceX96, tick } = decodeSlot0(slot0Raw);

  // 2. Enumerate LP positions ON OUR POOL by scanning PoolManager's
  //    ModifyLiquidity events filtered by our PoolId. This is cheap —
  //    one event per (un)mint on our specific pool, not a global v4 scan.
  //    The `salt` field in the event encodes the position's NFT tokenId
  //    when minted via the canonical PositionManager.
  const modifyLogs = await getLogs({
    api,
    target: POOL_MANAGER,
    eventAbi: 'event ModifyLiquidity(bytes32 indexed id, address indexed sender, int24 tickLower, int24 tickUpper, int256 liquidityDelta, bytes32 salt)',
    topics: [
      '0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec',
      POOL_ID, // filter to our pool
    ],
    fromBlock: DEPLOY_BLOCK,
    extraKey: 'armsys-modify-liquidity',
  });

  // Collect unique salts → tokenIds (only those minted via POSM).
  // The DefiLlama getLogs helper parses events into objects with `.args`
  // (named fields from the ABI). For non-POSM mints `salt` can be 0x00…00
  // or unrelated; we skip those.
  const tokenIdSet = new Set();
  for (const ev of modifyLogs) {
    let saltHex;
    if (ev.args && ev.args.salt !== undefined) {
      const s = ev.args.salt;
      // Handle BigNumber, BigInt, hex-string, or buffer forms uniformly.
      if (typeof s === 'string') saltHex = s;
      else if (typeof s === 'bigint') saltHex = '0x' + s.toString(16).padStart(64, '0');
      else if (s && typeof s.toHexString === 'function') saltHex = s.toHexString();
      else if (s && typeof s.toString === 'function') saltHex = s.toString();
    }
    if (!saltHex && ev.data && typeof ev.data === 'string') {
      // Fallback: data layout = tickLower(32) + tickUpper(32) + liquidityDelta(32) + salt(32).
      const hex = ev.data.slice(2);
      if (hex.length >= 256) saltHex = '0x' + hex.slice(192, 256);
    }
    if (!saltHex) continue;
    if (!saltHex.startsWith('0x')) saltHex = '0x' + saltHex;
    // Strip leading zeros, check for non-empty
    const tokenIdBn = new BigNumber(saltHex);
    if (tokenIdBn.isNaN() || tokenIdBn.isZero()) continue;
    tokenIdSet.add(tokenIdBn.toFixed());
  }

  let totalAmount0 = new BigNumber(0);
  let totalAmount1 = new BigNumber(0);

  // 3. For each unique token ID, fetch current liquidity + tick range and
  //    convert to underlying token amounts. Burned positions return 0
  //    liquidity and contribute nothing.
  for (const tokenId of tokenIdSet) {
    let info, liquidity;
    try {
      info = await api.call({
        target: POSITION_MANAGER,
        abi: 'function getPoolAndPositionInfo(uint256) view returns ((address,address,uint24,int24,address), uint256)',
        params: tokenId,
      });
      liquidity = await api.call({
        target: POSITION_MANAGER,
        abi: 'function getPositionLiquidity(uint256) view returns (uint128)',
        params: tokenId,
      });
    } catch (_) {
      continue;
    }
    if (!liquidity || liquidity === '0') continue;

    // Defensive: confirm the position's PoolKey hook matches ours.
    const hookAddr = (info[0][4] || '').toLowerCase();
    if (hookAddr !== HOOK.toLowerCase()) continue;

    // Decode PositionInfo (v4-periphery PositionInfoLibrary layout):
    //   bit 0..7   = hasSubscriber
    //   bit 8..31  = tickLower (int24)
    //   bit 32..55 = tickUpper (int24)
    const positionInfo = new BigNumber(info[1]);
    const MASK_24 = new BigNumber(2).pow(24).minus(1);
    let tL = positionInfo.div(new BigNumber(2).pow(8)).integerValue(BigNumber.ROUND_FLOOR).mod(MASK_24.plus(1)).toNumber();
    let tU = positionInfo.div(new BigNumber(2).pow(32)).integerValue(BigNumber.ROUND_FLOOR).mod(MASK_24.plus(1)).toNumber();
    if (tL >= (1 << 23)) tL -= (1 << 24);
    if (tU >= (1 << 23)) tU -= (1 << 24);

    const { amount0, amount1 } = positionToAmounts(liquidity, tL, tU, tick, sqrtPriceX96);
    totalAmount0 = totalAmount0.plus(amount0);
    totalAmount1 = totalAmount1.plus(amount1);
  }

  // currency0 is native ETH on this pool — report as WETH for DefiLlama
  // pricing (1:1 with ETH).
  api.add(WETH, totalAmount0.toFixed(0));
  api.add(USDC, totalAmount1.toFixed(0));
}

module.exports = {
  methodology:
    'ARMSys is a dynamic-fee hook for a Uniswap v4 ETH/USDC pool on Base mainnet. ' +
    'All pool reserves sit inside the v4 PoolManager singleton; the hook contract ' +
    'itself holds no underlying tokens. TVL is computed by enumerating every LP ' +
    'position NFT minted on the canonical Uniswap V4 PositionManager since the ' +
    'hook deploy block, filtering to positions whose PoolKey points at our hook, ' +
    'and converting each position\'s (liquidity, tickLower, tickUpper) plus the ' +
    'pool\'s current sqrtPriceX96 to amount0 + amount1 using standard concentrated-' +
    'liquidity math. Pool currency0 is native ETH (reported as WETH for pricing); ' +
    'currency1 is USDC.',
  start: 1745740800, // 2026-04-27 round-30 deploy
  base: {
    tvl,
  },
};
