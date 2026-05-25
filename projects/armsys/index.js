/**
 * ARMSys — Dynamic-Fee Hook for Uniswap v4 on Base
 *
 *   Base mainnet: ETH/USDC v4 pool, ARMSHookV3 (round-30, 2026-04-27).
 *                 Regime-aware dynamic fees + retail/MEV segmentation
 *                 via on-chain BNS-style volatility classifier.
 */
const { uniV4HookExport } = require('../helper/uniswapV4');

const HOOK = '0x7fB4846d3987476577319f112731BB04f45880C8'; // round-30

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
  doublecounted: true,
  base: {
    tvl: uniV4HookExport({hook: HOOK}),
  },
};
