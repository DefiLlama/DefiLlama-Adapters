const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

/**
 * ARMSys — Automated Risk Management System
 * Uniswap v4 Hook with LVR (Loss-Versus-Rebalancing) protection
 *
 * Arbitrum: USDC/USDT pool with Aave V3 vault (90% Aave / 10% pool)
 * Base:     ETH/USDC pool
 *
 * TVL = aToken balances on hook (Aave deposits) + direct token balances on hook
 *
 * Note: Pool liquidity managed via PoolManager is tracked through the hook's
 * totalValue() view function. For the adapter we count token balances directly
 * held by the hook contracts, which includes aTokens (1:1 with underlying).
 */

// --- Arbitrum addresses ---
const ARB_A_USDC = '0x724dc807b04555b71ed48a6896b6F41593b8C637'; // Aave V3 aUSDC
const ARB_A_USDT = '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'; // Aave V3 aUSDT

module.exports = {
  doublecounted: true, 
  methodology:
    'TVL is calculated as the sum of Aave V3 aToken balances (representing deposited stablecoins earning yield) plus any tokens held directly by the hook contracts. The Arbitrum hook routes 90% of deposits to Aave V3 and keeps 10% in the Uniswap v4 pool for swap liquidity.',
  arbitrum: {
    tvl: sumTokensExport({
      owner: '0x71a43681ab1C6572f9223b5a3493714d169FBac4', // ARB_HOOK
      tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT, ARB_A_USDC, ARB_A_USDT],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: '0x6Dc1ED78Ba7d10c7809337Eb075bf2eEDAE040C8', // BASE_HOOK
      tokens: [ADDRESSES.optimism.WETH_1, ADDRESSES.base.USDC],
    }),
  },
}