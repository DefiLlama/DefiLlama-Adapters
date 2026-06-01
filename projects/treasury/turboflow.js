const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { sumTokens2: solanaSumTokens } = require("../helper/solana");

// Protocol-operated Fireblocks MPC custody wallets that back TurboFlow
// user deposits and settlement obligations. These EOA/safe-style balances
// are tracked separately from the bridge-contract TVL exported by
// `projects/turboflow/index.js`, in line with DefiLlama's policy of not
// counting EOA/safe holdings toward TVL. All addresses are publicly
// disclosed by the protocol and verifiable on-chain.

// --- BSC ---

const BSC_FIREBLOCKS_VAULTS = [
  "0x8757f9E16d775759671e95e50D749CECCDA375AE", // Fireblocks MPC vault (SIG)
  "0x077Ab3f5D4372cA14c6AA417215Af3d91B55bAFc", // Fireblocks MPC vault (TFUSERS)
];

const BSC_TOKENS = [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC];

async function bscTvl(api) {
  return sumTokens2({ api, owners: BSC_FIREBLOCKS_VAULTS, tokens: BSC_TOKENS });
}

// --- Solana ---

const SOLANA_FIREBLOCKS_OWNERS = [
  "6FaXzEC4CNAh1ECxc8FUnjpcnMYYG4M7DVJ5ZMbTmcWH", // Fireblocks MPC vault (SIG)
  "4wHLLe6ovPqmGoBjvk6ogxgFbiGMCUUPvnMqmxyprX5C", // Fireblocks MPC vault (TFUSERS)
];

const SOLANA_FIREBLOCKS_PAIRS = SOLANA_FIREBLOCKS_OWNERS.flatMap((owner) => [
  [ADDRESSES.solana.USDT, owner],
  [ADDRESSES.solana.USDC, owner],
]);

async function solanaTvl(api) {
  // `computeTokenAccount: true` derives the canonical associated token
  // account (ATA) for each (mint, owner) pair locally and reads them via
  // a single `getMultipleAccounts` batched call, avoiding the throttled
  // `getTokenAccountsByOwner` path on public Solana RPCs from CI egress.
  //
  // `allowError: true` tolerates Fireblocks ATAs that have not yet been
  // initialised on chain (a mint/owner pair with no deposits to date)
  // by treating a missing account as a zero balance instead of throwing.
  return solanaSumTokens({
    api,
    tokensAndOwners: SOLANA_FIREBLOCKS_PAIRS,
    computeTokenAccount: true,
    allowError: true,
  });
}

module.exports = {
  methodology:
    "Treasury counts USDT and USDC balances held by TurboFlow's protocol-operated Fireblocks MPC custody wallets on BSC and Solana, which back user deposits and settlement obligations. The bridge contracts that receive user deposits are tracked separately as TVL (see projects/turboflow/index.js).",
  bsc: { tvl: bscTvl },
  solana: { tvl: solanaTvl },
};
