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
const ARB_HOOK = '0x71a43681ab1C6572f9223b5a3493714d169FBac4';
const ARB_USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const ARB_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const ARB_A_USDC = '0x724dc807b04555b71ed48a6896b6F41593b8C637'; // Aave V3 aUSDC
const ARB_A_USDT = '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'; // Aave V3 aUSDT

// --- Base addresses ---
const BASE_HOOK = '0x6Dc1ED78Ba7d10c7809337Eb075bf2eEDAE040C8';
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_WETH = '0x4200000000000000000000000000000000000006';

async function arbitrumTvl(api) {
  // 1. Count Aave V3 aToken balances on hook (90% of deposited TVL)
  //    aTokens accrue interest and are 1:1 redeemable for underlying
  const aUsdcBal = await api.call({
    target: ARB_A_USDC,
    params: ARB_HOOK,
    abi: 'erc20:balanceOf',
  });
  const aUsdtBal = await api.call({
    target: ARB_A_USDT,
    params: ARB_HOOK,
    abi: 'erc20:balanceOf',
  });

  // Map aToken balances to underlying tokens for correct pricing
  api.add(ARB_USDC, aUsdcBal);
  api.add(ARB_USDT, aUsdtBal);

  // 2. Count any direct USDC/USDT on hook (dust from rebalancing, lazy deposits)
  await api.sumTokens({
    owner: ARB_HOOK,
    tokens: [ARB_USDC, ARB_USDT],
  });
}

async function baseTvl(api) {
  // Base hook: simple ETH/USDC pool, no Aave routing
  // Count direct token balances on hook contract
  await api.sumTokens({
    owner: BASE_HOOK,
    tokens: [BASE_WETH, BASE_USDC],
  });
}

module.exports = {
  methodology:
    'TVL is calculated as the sum of Aave V3 aToken balances (representing deposited stablecoins earning yield) plus any tokens held directly by the hook contracts. The Arbitrum hook routes 90% of deposits to Aave V3 and keeps 10% in the Uniswap v4 pool for swap liquidity.',
  arbitrum: {
    tvl: arbitrumTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
