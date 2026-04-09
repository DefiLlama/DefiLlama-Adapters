const axios = require("axios");
const { queryContract } = require("../helper/chain/cosmos");

// ============================================================
// Stellar — Soroban TVL Logger (get_active_tvl)
// Queries the on-chain Logger contract via Soroban RPC simulation.
// The contract returns active vault liquidity denominated in USD
// with 7 decimal places.
// ============================================================

const SOROBAN_RPC = "https://soroban-rpc.mainnet.stellar.gateway.fm";
const STELLAR_SIM_TX =
  "AAAAAgAAAABInMr//HjTQ5mfaqRBHzYCJKEHrM2r8m9/4lm9PBoMVgABhqAAAAAAAAAAAgAAAAEAAAAAAAAAAAAAAABpkzaBAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAAB61PtVr2XWjuuWsIcyFlAq888asA0bR8BnY/AeIm0wxQAAAAOZ2V0X2FjdGl2ZV90dmwAAAAAAAAAAAAAAAAAAAAAAAA=";

async function getStellarActiveTvl() {
  const { data: json } = await axios.post(SOROBAN_RPC, {
    jsonrpc: "2.0",
    id: 1,
    method: "simulateTransaction",
    params: { transaction: STELLAR_SIM_TX },
  }, { headers: { "Content-Type": "application/json" } });

  const xdr = json?.result?.results?.[0]?.xdr;
  if (!xdr) throw new Error("TVL value not returned from Soroban simulation");

  const buffer = Buffer.from(xdr, "base64");
  return BigInt("0x" + buffer.slice(-16).toString("hex"));
}

async function stellarTvl(api) {
  const activeTvl = await getStellarActiveTvl();
  if (activeTvl === 0n) throw new Error("Stellar TVL is zero");

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
async function tvl(api) {
    const activeTvl = await getActiveTvl();
  
    if (activeTvl === 0n) throw new Error("TVL is zero");
  
    const normalized = Number(activeTvl) / 1e7;
    api.addCGToken("usd-coin", normalized);
  
    return api.getBalances();
  }
  

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the total active liquidity across invoice-backed pools, reported by on-chain Logger contracts on Stellar (Soroban) and ZigChain (CosmWasm).",
  stellar: { tvl: stellarTvl },
  zigchain: { tvl: zigchainTvl },
};
