/**
 * efixDI+ Protocol — DefiLlama TVL Adapter
 *
 * Tokenized Brazilian DI fund shares (CDI rate ~14.9% APY).
 * Regulated under CVM Resolution 88/2022.
 *
 * TVL = totalSupply of efixDI on each chain.
 * Each token is backed 1:1 by Brazilian DI fund shares.
 *
 * Cross-chain: LayerZero V2 OFT bridge (lock on Polygon, mint on Base).
 * Some tokens are also minted directly on Base via MinterBurner.
 * Counting both chains is the most accurate approach.
 *
 * Chainlink BRL/USD oracle: 0xB90DA3ff54C3ED09115abf6FbA0Ff4645586af2c (Polygon)
 */

// —— Token addresses per chain ——————————————————————————————
const EFIX_DI_TOKEN_POLYGON = "0x04082b283818D9d0dd9Ee8742892eEe5CC396441";
const EFIX_DI_TOKEN_BASE = "0xF5cA55f3ea5Bcd180aEa6dF9E05a0E63A66f5608";

// —— TVL functions ————————————————————————————————————————

/**
 * Polygon TVL = totalSupply of efixDI on Polygon.
 * Tokens are minted when users deposit BRL via PIX.
 */
async function polygonTvl(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: EFIX_DI_TOKEN_POLYGON,
  });

  api.add(EFIX_DI_TOKEN_POLYGON, totalSupply);
}

/**
 * Base TVL = totalSupply of efixDI on Base.
 * Tokens arrive via LayerZero V2 OFT bridge or direct minting.
 * Used as collateral in Morpho Blue lending market.
 */
async function baseTvl(api) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: EFIX_DI_TOKEN_BASE,
  });

  api.add(EFIX_DI_TOKEN_BASE, totalSupply);
}

// —— Module exports ———————————————————————————————————————

module.exports = {
  methodology:
    "TVL is the total supply of efixDI tokens on each chain. " +
    "Each efixDI token is backed 1:1 by Brazilian DI fund shares (CDI rate). " +
    "On Polygon, tokens are minted when users deposit BRL via PIX. " +
    "On Base, tokens are minted via LayerZero V2 OFT bridge or directly for DeFi use.",
  misrepresentedTokens: true,
  doublecounted: false,
  start: 1769990400, // Feb 2, 2026 00:00:00 UTC — VaultV2 deployment
  polygon: {
    tvl: polygonTvl,
  },
  base: {
    tvl: baseTvl,
  },
};
