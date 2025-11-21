const { DRIFT_VAULTS, START_TIMESTAMP } = require("./constants");
const { getTvl: getDriftVaultTvl } = require("./utils/drift");

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
  start: START_TIMESTAMP,
  timetravel: false,
  doublecounted: false,
  methodology: "The combined TVL of all vaults.",
  solana: { tvl },
};
