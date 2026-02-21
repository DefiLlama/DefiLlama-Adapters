// DefiLlama TVL Adapter for YieldCore (yieldcore.app)
// Chain: BNB Smart Chain (BSC)
// Contract: 0x2375Fcc2a256425228aA94d7100093230761639e
//
// How YieldCore works:
//   1. Users deposit USDT into the YieldCore contract to buy bonds
//   2. The operator periodically moves funds into a Krystal vault to earn yield
//   3. Funds are returned to the YieldCore contract before bond maturity payouts
//
// TVL = USDT held in YieldCore contract + USDT held in Krystal vault
// Both locations must be summed to avoid undercounting when funds are deployed.

const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

// The main YieldCore bond contract on BSC
const YIELDCORE_CONTRACT = "0x2375Fcc2a256425228aA94d7100093230761639e";

// The Krystal PrivateVault contract where funds are deployed for yield
// Verified on BscScan as a Krystal PrivateVault, created by the YieldCore deployer.
// Funds are periodically moved here from the main contract and returned at bond maturity.
const KRYSTAL_VAULT_ADDRESS = "0xeE9dd48b2Aa7Ab67534c6Da5E1cD261263d46ef7";

async function tvl(api) {
  // Sum USDT balances across both the main contract and the Krystal vault
  // This ensures TVL is accurate regardless of where funds are deployed at any given time
  return sumTokens2({
    api,
    tokens: [ADDRESSES.bsc.USDT],
    owners: [YIELDCORE_CONTRACT, KRYSTAL_VAULT_ADDRESS],
  });
}

module.exports = {
  start: 1770354988, // YieldCore deployment: 2026-02-06 05:16:28 UTC
  methodology:
    "TVL is calculated as the total USDT deposited by users into YieldCore bonds. " +
    "Funds may sit in the main YieldCore contract or be temporarily deployed in a Krystal vault " +
    "to generate yield for bondholders. Both balances are summed to reflect true TVL.",
  bsc: {
    tvl,
  },
};