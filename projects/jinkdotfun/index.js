/**
 * Jink (jink.fun) — TVL Adapter for DefiLlama
 *
 * Repo: DefiLlama/DefiLlama-Adapters  →  projects/jink/index.js
 *
 * TVL = sum of USDT held in every JinkVault deployed by the Factory.
 * Each perps market has its own vault holding vaultBalance + insuranceBalance
 * denominated in USDT (BSC).
 */

const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

// ── Deployed contracts (BSC mainnet) ─────────────────────────────
const FACTORY = "0x56C933DbBE553a271b9b0b1638aA21a618125E1d";
const USDT = ADDRESSES.bsc.USDT; // 0x55d398326f99059fF775485246999027B3197955

// MarketCreated(address indexed token, address indexed opener, address vault, address perps, address botWallet)
const MARKET_CREATED_TOPIC =
  "0x"; // replace with actual topic0 after deployment — see note below

/**
 * Discover all vault addresses from MarketCreated events emitted by the Factory.
 */
async function getVaults(api) {
  const logs = await api.getLogs({
    target: FACTORY,
    fromBlock: 93892264, // adjust to Factory deploy block
    eventAbi:
      "event MarketCreated(address indexed token, address indexed opener, address vault, address perps, address botWallet)",
  });

  // Each log → vault address is the 3rd arg
  return logs.map((l) => l.args.vault || l.vault);
}

async function tvl(api) {
  const vaults = await getVaults(api);

  // Sum USDT balance in every vault contract
  return sumTokens2({
    api,
    owners: vaults,
    tokens: [USDT],
  });
}

module.exports = {
  methodology:
    "TVL is the sum of USDT held across all JinkVault contracts deployed by the JinkFactory on BSC. Each perpetual futures market has a dedicated vault holding trader collateral and an insurance fund.",
  bsc: {
    tvl,
  },
};
