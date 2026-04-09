const { callSoroban } = require("../helper/chain/stellar");
const { queryContract } = require("../helper/chain/cosmos");

// ============================================================
// Stellar — Soroban TVL Logger (get_active_tvl)
// Queries the on-chain Logger contract via Soroban RPC simulation.
// The contract returns active vault liquidity denominated in USD
// with 7 decimal places.
// ============================================================

const STELLAR_CONTRACT = "CDVVH3KWXWLVUO5OLLBBZSCZICV46PDKYA2G2HYBTWH4A6EJWTBRIXRK";

async function stellarTvl(api) {
  const activeTvl = await callSoroban(STELLAR_CONTRACT, "get_active_tvl");

  if (!activeTvl) throw new Error("Stellar TVL is zero");

  api.addCGToken("usd-coin", Number(activeTvl) / 1e7);
  return api.getBalances();
}

// ============================================================
// ZigChain — CosmWasm TVL Logger (active_tvl)
// Queries the on-chain Logger contract via LCD REST endpoint.
// The contract returns active liquidity in DeFa zigchian contracts denominated in USD
// with 6 decimal places.
// ============================================================

const ZIGCHAIN_TVL_CONTRACT = "zig19pp9rxhqktgpf2yqkwwx6yekmgvnu3hvj0c4e5rlpw88l0shh3qs9qcdyg";

async function zigchainTvl(api) {
  const activeTvl = await queryContract({
    contract: ZIGCHAIN_TVL_CONTRACT,
    chain: "zigchain",
    data: { active_tvl: {} },
  });

  if (!activeTvl || activeTvl === "0") throw new Error("ZigChain TVL is zero");

  api.addCGToken("usd-coin", Number(activeTvl) / 1e6);
  return api.getBalances();
}

// ============================================================
// Export
// ============================================================

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "TVL is the total active liquidity across invoice-backed pools, reported by on-chain Logger contracts on Stellar (Soroban) and ZigChain (CosmWasm).",
  stellar: { tvl: stellarTvl },
  zigchain: { tvl: zigchainTvl },
};
