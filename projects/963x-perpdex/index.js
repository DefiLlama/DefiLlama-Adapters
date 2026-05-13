/**
 * DefiLlama TVL adapter for 963X PerpDEX
 *
 * Submit by:
 *   1. Fork https://github.com/DefiLlama/DefiLlama-Adapters
 *   2. Copy this folder to `projects/963x-perpdex/`
 *   3. Open PR titled: "Add 963X PerpDEX"
 *
 * TVL sources (Arbitrum One):
 *   - USDBVaultV2:      USDB collateral (WBTC + WETH locked)
 *   - PerpDEXVault:     USDC posted as margin
 *   - DeltaNeutralVault: USDC under management
 *   - SimpleLending:    USDC + asset deposits
 *
 * Methodology: sum of underlying token balances held by protocol contracts,
 * priced in USD via DefiLlama price oracle.
 */
const { sumTokens2 } = require("../helper/unwrapLPs");

// Tokens (Arbitrum One)
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

// Protocol contracts (Arbitrum One)
const USDB_VAULT_V2 = "0xDf2A388501E428F0208d039B448bDD237c308b6D";
const PERPDEX_VAULT = "0x7C00724033Dfb62A581DB362c124EAcCc565f76B";
const DELTA_NEUTRAL_VAULT = "0x0184A423FAda16DC2a17Af80005858eD52d89E75";
const SIMPLE_LENDING = "0x6C47DD2DBB43285fF41de967bB3EB4Ce65eDfD00";
const YIELD_AGGREGATOR = "0x4658FA8AB83C09E3AEE4D616cbd5b62a3D4d41C0";
const YIELD_FARMING = "0xE23CA220dA073BBa826763ab2051a9d6815cDDfD";

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      // USDB Vault holds WBTC + WETH as collateral backing USDB stablecoin
      [WBTC, USDB_VAULT_V2],
      [WETH, USDB_VAULT_V2],
      // PerpDEX Vault holds USDC margin
      [USDC, PERPDEX_VAULT],
      [USDT, PERPDEX_VAULT],
      // Delta neutral / yield strategies
      [USDC, DELTA_NEUTRAL_VAULT],
      [USDC, YIELD_AGGREGATOR],
      [USDC, YIELD_FARMING],
      // Lending
      [USDC, SIMPLE_LENDING],
      [USDT, SIMPLE_LENDING],
      [WBTC, SIMPLE_LENDING],
      [WETH, SIMPLE_LENDING],
    ],
  });
}

module.exports = {
  methodology:
    "TVL is the sum of all underlying collateral and margin tokens (USDC, USDT, WBTC, WETH) " +
    "locked in 963X protocol contracts on Arbitrum One: USDBVaultV2 (USDB stablecoin collateral), " +
    "PerpDEXVault (perpetual margin), DeltaNeutralVault, SimpleLending and yield strategies. " +
    "963X governance token itself is not counted as TVL.",
  start: 1762560000, // 2025-11-08 — Arbitrum One mainnet deploy
  arbitrum: {
    tvl,
  },
};
