
const { getTvl: getDriftVaultTvl } = require("../neutral-trade/utils/drift")

const DRIFT_VAULTS = [
  // PUBLIC
  {
    name: "USDC Alpha Stable",
    address: "EwHHtPNHttdUNHxVFdt9v1xuQyDnNcE5FzXWSTh1HG7n",
  },
  {
    name: "USDC Alpha Aggressive",
    address: "93gLh83YceGb6Cm3oYdutZ8xY9si5JX5dU7Ei6LkZHbJ",
  },
  {
    name: "USDC Staking (Neutral JLP)",
    address: "DrC6TVpLHtyL4JvFnxLscQsxatmN1sRi4v8SN2uqBDa7",
  },
];


async function drift_vaults_tvl(api) {
  await getDriftVaultTvl(
    api,
    DRIFT_VAULTS.map((vault) => vault.address)
  );
}

async function tvl(api) {
  await drift_vaults_tvl(api);
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "The combined TVL of all vaults.",
  solana: { tvl },
};
