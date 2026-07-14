/**
 * efixDI+ Protocol - DefiLlama TVL Adapter v7
 *
 * TVL = circulating efixDI supply across Polygon + Base, priced at NAV.
 *
 * Cross-chain: LayerZero V2 OFT bridge with LOCK-AND-MINT semantics
 * (verified on-chain 2026-07-14): bridging Polygon -> Base LOCKS efixDI
 * in the OFTAdapter on Polygon and MINTS the same units on Base. The
 * locked balance duplicates supply already counted on Base, so Polygon
 * TVL subtracts the OFTAdapter balance (235 efixDI locked at the time
 * of verification).
 *
 * Pricing: efixDI has no external feed. Each token is a claim on cotas
 * of a BTG Pactual DI fund whose NAV accrues CDI daily, so 1 efixDI is
 * not 1 BRL. We read the market's own on-chain oracle on Base
 * (EfixDIEulerOracle: NAV(BRL) x Chainlink BRL/USD, sequencer and
 * staleness guards), the same oracle securing the live Euler v2
 * efixDI/USDC market.
 */

const sdk = require("@defillama/sdk");

// --- Contract addresses ---
const efixDIPolygon = "0x04082b283818D9d0dd9Ee8742892eEe5CC396441";
const efixDIBase = "0xF5cA55f3ea5Bcd180aEa6dF9E05a0E63A66f5608";
const OFT_ADAPTER_POLYGON = "0x603265754fDdd7FdE459CC6e6722bd526C1258Fc"; // lock side of the bridge
const EULER_ORACLE_BASE = "0x9CD219A773d94BBECdD1bb0ae413c45f72737788"; // NAV(BRL) x Chainlink BRL/USD

// USDC addresses (used as USD-equivalent for pricing)
const USDC_POLYGON = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC.e 6 decimals
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // native USDC 6 decimals

const getQuoteAbi =
  "function getQuote(uint256 inAmount, address base, address quote) view returns (uint256)";

/**
 * Price of 1 efixDI in USD, from the on-chain NAV oracle on Base.
 * Always read from Base regardless of which chain's TVL is computed.
 */
async function getEfixDIPriceUsd() {
  const quote = await sdk.api2.abi.call({
    chain: "base",
    target: EULER_ORACLE_BASE,
    abi: getQuoteAbi,
    params: [String(10n ** 18n), efixDIBase, USDC_BASE],
  });
  const price = Number(quote) / 1e6; // USDC 6 decimals ~ USD

  // Sanity: NAV x BRL/USD should stay well inside this band
  if (price < 0.05 || price > 0.6) {
    throw new Error("efixDI price " + price + " out of expected range");
  }
  return price;
}

/**
 * Polygon TVL: totalSupply minus the OFTAdapter locked balance
 * (locked tokens are mirrored 1:1 on Base and counted there).
 */
async function polygonTvl(api) {
  const [totalSupply, locked] = await Promise.all([
    api.call({ target: efixDIPolygon, abi: "erc20:totalSupply" }),
    api.call({ target: efixDIPolygon, abi: "erc20:balanceOf", params: [OFT_ADAPTER_POLYGON] }),
  ]);
  const price = await getEfixDIPriceUsd();

  const circulating = (Number(totalSupply) - Number(locked)) / 1e18;
  api.add(USDC_POLYGON, Math.floor(circulating * price * 1e6));
}

/**
 * Base TVL: full totalSupply (native treasury mints + bridge-minted units).
 */
async function baseTvl(api) {
  const totalSupply = await api.call({ target: efixDIBase, abi: "erc20:totalSupply" });
  const price = await getEfixDIPriceUsd();

  const supply = Number(totalSupply) / 1e18;
  api.add(USDC_BASE, Math.floor(supply * price * 1e6));
}

module.exports = {
  methodology:
    "TVL is the circulating supply of efixDI: Polygon supply minus the LayerZero " +
    "OFTAdapter locked balance, plus Base supply (the bridge is lock-and-mint, so " +
    "locked tokens are already represented on Base). Each efixDI is backed 1:1 by " +
    "cotas of a BTG Pactual DI fund under a CVM-registered securitizer and is priced " +
    "by the on-chain NAV(BRL) x Chainlink BRL/USD oracle that also secures the live " +
    "Euler v2 efixDI/USDC market on Base. Lending vault balances are intentionally " +
    "not added, as they are part of this circulating supply.",
  misrepresentedTokens: true,
  doublecounted: false,
  start: 1769990400, // Feb 2, 2026 - VaultV2 deployment
  polygon: {
    tvl: polygonTvl,
  },
  base: {
    tvl: baseTvl,
  },
};