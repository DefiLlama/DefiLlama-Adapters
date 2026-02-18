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

// The main YieldCore bond contract on BSC
const YIELDCORE_CONTRACT = "0x2375Fcc2a256425228aA94d7100093230761639e";

// The Krystal PrivateVault contract where funds are deployed for yield
// Verified on BscScan as a Krystal PrivateVault, created by the YieldCore deployer.
// Funds are periodically moved here from the main contract and returned at bond maturity.
const KRYSTAL_VAULT_ADDRESS = "0xeE9dd48b2Aa7Ab67534c6Da5E1cD261263d46ef7";

// USDT on BSC (Binance-Peg USDT)
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";

async function tvl(api) {
  // Sum USDT balances across both the main contract and the Krystal vault
  // This ensures TVL is accurate regardless of where funds are deployed at any given time
  return sumTokens2({
    api,
    tokens: [USDT_BSC],
    owners: [YIELDCORE_CONTRACT, KRYSTAL_VAULT_ADDRESS],
  });
}

module.exports = {
  methodology:
    "TVL is calculated as the total USDT deposited by users into YieldCore bonds. " +
    "Funds may sit in the main YieldCore contract or be temporarily deployed in a Krystal vault " +
    "to generate yield for bondholders. Both balances are summed to reflect true TVL.",
  bsc: {
    tvl,
  },
};
