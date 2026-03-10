// DefiLlama TVL Adapter for HyperSafe
// Tracks ETH locked in all bonding curve tokens launched via TokenFactory on Base mainnet
// Submit to: https://github.com/DefiLlama/DefiLlama-Adapters
// Path: projects/hypersafe/index.js

const { getLogs } = require("../helper/cache/getLogs");

const FACTORY_ADDRESS = "0x5534C7Fc1faF7b87ca58fEdA22cC8be47A2F2B44";

// TokenLaunched event: emitted when a new bonding curve token is created
const TOKEN_LAUNCHED_TOPIC =
  "0x" +
  require("ethers").utils
    .id("TokenLaunched(address,address,string,string,string,string)")
    .slice(2);

async function tvl(api) {
  // Get all TokenLaunched events from the factory since deployment
  const logs = await getLogs({
    api,
    target: FACTORY_ADDRESS,
    eventAbi:
      "event TokenLaunched(address indexed token, address indexed creator, string name, string symbol, string imageUrl, string description)",
    onlyArgs: true,
    fromBlock: 27000000, // Approximate Base block at deployment time (March 2026)
  });

  // Collect all deployed token contract addresses
  const tokenAddresses = logs.map((log) => log.token);

  if (tokenAddresses.length === 0) return;

  // Sum ETH balance held by each bonding curve contract
  // Each token holds ETH as users buy tokens — this IS the TVL
  await api.getBalances({
    targets: tokenAddresses,
    chain: "base",
  });
}

module.exports = {
  methodology:
    "TVL is the sum of all ETH held in bonding curve token contracts deployed via the HyperSafe TokenFactory on Base. Each token contract holds ETH proportional to tokens purchased along its bonding curve.",
  start: 1741564800, // March 10, 2026 UTC (deployment date)
  base: {
    tvl,
  },
};
