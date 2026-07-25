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
    'TVL is calculated from liquidity in ARMSys pools, which are hooks on Uniswap V4 PoolManager.',
  doublecounted: true,
  timetravel: false,
  base: {
    tvl: uniV4HookExport({hook: HOOK}),
  },
};
