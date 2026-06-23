const { get } = require("../../helper/http");
const { VOLTR_VAULTS_URL, VOLTR_ASSET_MINTS } = require("../constants");

async function addTvl(api) {
  let vaults;
  try {
    ({ vaults } = await get(VOLTR_VAULTS_URL));
  } catch (e) {
    console.log(`Voltr: failed to fetch vaults from ${VOLTR_VAULTS_URL}: ${e.message}`);
    return;
  }
  if (!Array.isArray(vaults)) {
    console.log(`Voltr: unexpected response from ${VOLTR_VAULTS_URL}, expected vaults array but got ${typeof vaults}`);
    return;
  }
  for (const vault of vaults) {
    const mint = VOLTR_ASSET_MINTS[vault.asset?.name];
    if (!mint) {
      // Only count assets in the allowlist (i.e. ones DefiLlama can price).
      console.log(`Voltr: skipping unsupported asset ${vault.asset?.name} for vault ${vault.pubkey}`);
      continue;
    }
    // `tvl` is the raw token amount; DefiLlama prices it by mint.
    api.add(mint, vault.tvl);
  }
}

module.exports = {
  addTvl,
};
