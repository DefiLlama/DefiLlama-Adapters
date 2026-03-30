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
 * Staking tracks hzUSD deposited in the shzUSD vault (ERC-4626).
 */

// HypeZionExchangeInformation proxy (Hyperliquid Mainnet)
const EXCHANGE_INFO = "0x9286ABAC7c29e8A183155E961a4E4BBA2E162c7A";

// StakedHzUSD (shzUSD) vault
const STAKED_HZUSD = "0xce01a9B9bc08f0847fb745044330Eff1181360Cd";

// hzUSD token
const HZUSD = "0x6E2ade6FFc94d24A81406285c179227dfBFc97CE";

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

async function staking(api) {
  const totalAssets = await api.call({
    target: STAKED_HZUSD,
    abi: "uint256:totalAssets",
  });
  api.add(HZUSD, totalAssets);
}

module.exports = {
  methodology:
    "TVL is the sum of all HYPE reserves across four yield sources: kHYPE via Kinetiq, Valantis kHYPE/WHYPE and stHYPE/WHYPE LP pools, and direct stHYPE staking. Staking TVL tracks hzUSD deposited in the shzUSD vault.",
  hyperliquid: {
    tvl,
    staking,
  },
};
