const { treasuryExports } = require("../helper/treasury");

// CUSD — internal settlement stablecoin (6 decimals)
const CUSD = "0xc5079966b3190909f69306fE7587ffE493dEdB5F";

// Protocol-owned CUSD reserves earmarked for staking incentive distribution.
// These are NOT user-staked positions — they are protocol inventory.
const REWARD_VAULTS = [
  "0x9057c3a25ff8e71bc05782a3d44a74fa7eb95688",   // Gold Reward Vault
  "0x54ecbcb04da981f3a6896ad1b83c5ec47ee4d618",   // Silver Reward Vault
  "0xf98f5908fa0b2b0cb32b79f2612446c7e3bffcad",   // Platinum Reward Vault
  "0x2f30fd7b18b8c69e85131e387d88919ae85f26c1",   // Palladium Reward Vault
];

module.exports = treasuryExports({
  bsc: {
    tokens: [CUSD],
    owners: REWARD_VAULTS,
  },
});
