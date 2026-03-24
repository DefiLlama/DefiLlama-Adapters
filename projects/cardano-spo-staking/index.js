const { get } = require("../helper/http");

// Koios is a decentralized, community-maintained API for querying the Cardano blockchain.
// Docs: https://api.koios.rest
//
// We use two endpoints:
//   1. /tip          → get current epoch number
//   2. /epoch_info   → get active_stake for that epoch (total ADA delegated to all SPOs)
//
// The active_stake field represents the total lovelace actively delegated across all
// stake pools for a given epoch. This is the canonical "total staked ADA" figure.

const KOIOS_API = "https://api.koios.rest/api/v1";

async function staking() {
  // Step 1: Get the current epoch number from chain tip
  const tipResponse = await get(`${KOIOS_API}/tip`);
  if (!tipResponse || !tipResponse.length) {
    throw new Error("Failed to fetch current epoch from Koios /tip");
  }
  const [tip] = tipResponse;
  const currentEpoch = tip.epoch_no;

  // Step 2: Get epoch info which includes active_stake
  // We request the previous completed epoch since active_stake for the current
  // epoch may still be computing. The prior epoch gives us the most recent
  // confirmed total stake snapshot.
  const epochToQuery = currentEpoch - 1;
  const epochInfo = await get(
    `${KOIOS_API}/epoch_info?_epoch_no=${epochToQuery}&select=active_stake`
  );

  // active_stake is returned in lovelace (1 ADA = 1,000,000 lovelace)
  // Use BigInt to avoid precision loss for values exceeding Number.MAX_SAFE_INTEGER
  if (!epochInfo || !epochInfo.length || !epochInfo[0].active_stake) {
    throw new Error(`No active_stake data for epoch ${epochToQuery}`);
  }
  const activeStakeLovelace = BigInt(epochInfo[0].active_stake);
  const activeStakeAda = Number(activeStakeLovelace / BigInt(1e6));

  // Return as ADA using coingecko ID; DeFi Llama SDK handles USD conversion
  return {
    cardano: activeStakeAda,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the total ADA actively delegated to all Cardano stake pool operators (SPOs) " +
    "via the Ouroboros proof-of-stake consensus mechanism. Data is sourced from the Koios " +
    "decentralized API's /epoch_info endpoint, which reports the aggregate active stake " +
    "(in lovelace) snapshot across all registered stake pools for each epoch (~5 days). " +
    "The adapter queries the most recently completed epoch to ensure the stake snapshot " +
    "is finalized.",
  cardano: {
    tvl: () => ({}),
    staking,
  },
};
