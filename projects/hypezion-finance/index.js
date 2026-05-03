/**
 * HypeZion — Structured Product Protocol on Hyperliquid L1
 *
 * Issues stablecoin (hzUSD) and leverage token (BullHYPE) backed by HYPE reserves.
 * Reserves are deployed across multiple yield sources:
 *   - Kinetiq kHYPE liquid staking (primary)
 *   - Valantis kHYPE/WHYPE and stHYPE/WHYPE LP pools (secondary)
 *   - Direct stHYPE staking (secondary)
 *
 * TVL is aggregated on-chain via getProtocolTVL() on HypeZionExchangeInformation.
 */

// HypeZionExchangeInformation proxy (Hyperliquid Mainnet)
const EXCHANGE_INFO = "0x9286ABAC7c29e8A183155E961a4E4BBA2E162c7A";

const abis = {
  getProtocolTVL:
    "function getProtocolTVL() view returns (tuple(uint256 totalTVLInHYPE, uint256 primaryReserveInHYPE, uint256 secondaryReserveInHYPE, uint256 stakedHzUSDAmount, uint256 hypePriceUSD))",
};

async function tvl(api) {
  const tvlData = await api.call({
    target: EXCHANGE_INFO,
    abi: abis.getProtocolTVL,
  });
  api.addGasToken(tvlData.totalTVLInHYPE);
}

module.exports = {
  methodology:
    "TVL is the sum of all HYPE reserves across four yield sources: kHYPE via Kinetiq, Valantis kHYPE/WHYPE and stHYPE/WHYPE LP pools, and direct stHYPE staking. Marked doublecounted because these reserves are also reported by the underlying Kinetiq, Valantis, and stHYPE adapters. Staking (hzUSD in shzUSD vault) is intentionally not tracked to avoid double-counting the same HYPE collateral already reflected in TVL.",
  doublecounted: true,
  hyperliquid: {
    tvl,
  },
};
