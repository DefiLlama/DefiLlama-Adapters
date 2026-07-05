const { callSoroban } = require("../helper/chain/stellar");
const { queryContract } = require("../helper/chain/cosmos");
const { call } = require("../helper/chain/starknet");

// ============================================================
// Stellar — Soroban TVL Logger (get_active_tvl)
// Queries the on-chain Logger contract via Soroban RPC simulation.
// The contract returns active vault liquidity denominated in USD
// with 7 decimal places.
// ============================================================

const STELLAR_CONTRACT = "CDVVH3KWXWLVUO5OLLBBZSCZICV46PDKYA2G2HYBTWH4A6EJWTBRIXRK";

async function stellarTvl(api) {
  const activeTvl = await callSoroban(STELLAR_CONTRACT, "get_active_tvl");

  const stellarValue = Number(activeTvl) / 1e7;
  if (!Number.isFinite(stellarValue) || stellarValue <= 0) throw new Error("Stellar TVL is invalid");

  api.addCGToken("usd-coin", stellarValue);
  return api.getBalances();
}

// ============================================================
// ZigChain — CosmWasm TVL Logger (active_tvl)
// Queries the on-chain Logger contract via LCD REST endpoint.
// The contract returns active liquidity in DeFa zigchain contracts denominated in USD
// with 6 decimal places.
// ============================================================

const ZIGCHAIN_TVL_CONTRACT = "zig19pp9rxhqktgpf2yqkwwx6yekmgvnu3hvj0c4e5rlpw88l0shh3qs9qcdyg";

async function zigchainTvl(api) {
  const activeTvl = await queryContract({
    contract: ZIGCHAIN_TVL_CONTRACT,
    chain: "zigchain",
    data: { active_tvl: {} },
  });

  const zigValue = Number(activeTvl) / 1e6;
  if (!Number.isFinite(zigValue) || zigValue <= 0) throw new Error("ZigChain TVL is invalid");

  api.addCGToken("usd-coin", zigValue);
  return api.getBalances();
}

// ============================================================
// Starknet — Cairo TVL Logger (get_active_tvl)
// Queries the on-chain Logger contract via Starknet RPC.
// The contract returns active liquidity in DeFa starknet contracts denominated in USD
// with 6 decimal places.
// ============================================================

// TVL logger (get_active_tvl, get_tvl_snapshot). Verified 2026-07-03:
// get_active_tvl returns ~$224,994 of active TVL on mainnet.
const STARKNET_TVL_CONTRACT = "0x0595a45952ef488d49342cd4fdf062482ab51c0718fcd8c11ff6614034b0939d";

const getActiveTvlAbi = {
  name: "get_active_tvl",
  type: "function",
  inputs: [],
  outputs: [{ type: "core::integer::u128" }],
  state_mutability: "view",
};

async function starknetTvl(api) {
  const activeTvl = await call({ target: STARKNET_TVL_CONTRACT, abi: getActiveTvlAbi });

  const starknetValue = Number(activeTvl) / 1e6;
  if (!Number.isFinite(starknetValue) || starknetValue <= 0) throw new Error("Starknet TVL is invalid");

  api.addCGToken("usd-coin", starknetValue);
  return api.getBalances();
}

// ============================================================
// Ethereum — PSP / PayFi settlement liquidity
// Short-cycle settlement liquidity in the DeFa PayFi layer (USDC).
// ============================================================

const DEFA_PAYFI_ADDRESS = "0x182D16434faa044B9216A490CF0955B04AE16904";
const ETH_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

async function ethereumTvl(api) {
  return api.sumTokens({ owner: DEFA_PAYFI_ADDRESS, tokens: [ETH_USDC] });
}

// ============================================================
// Export
// ============================================================

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "TVL is DeFa's on-chain liquidity: active invoice-backed pool liquidity reported by on-chain Logger contracts on Stellar (Soroban), ZigChain (CosmWasm) and Starknet (Cairo), plus USDC settlement liquidity in the DeFa PSP/PayFi layer on Ethereum.",
  stellar: { tvl: stellarTvl },
  zigchain: { tvl: zigchainTvl },
  starknet: { tvl: starknetTvl },
  ethereum: { tvl: ethereumTvl },
};
