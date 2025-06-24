
const sui = require("../helper/chain/sui");
const ADDRESSES = require("../helper/coreAssets.json");

const VAULT_REGISTRY_SUI = "0xa16f2aef5db003653344700dec7a8151ba6bf029db6bbf8d70025f5a55ff042e"; // Vault Registry SUI type address
const STABILITY_POOL_SUI = "0xfe9bed337b3880bb3eb157f779a600332bb48da14fd04ae20ec8974ce60712ac"; // Stability Pool SUI type address

async function tvl(api) {
 
  // Collateral in vaults (SUI)
  const registrySUI = await sui.getObject(VAULT_REGISTRY_SUI);
  const totalCollateralSUI = Number(registrySUI.fields.total_collateral) / 1e9;
  api.add(ADDRESSES.sui.SUI, totalCollateralSUI);

  // DORI staked in Stability Pool
  const stabilityPool = await sui.getObject(STABILITY_POOL_SUI);
  const doriStaked = Number(stabilityPool.fields.total_dori_balance);
  api.add(ADDRESSES.sui.DORI, doriStaked);
}

async function borrowed(api) {
  const registrySUI = await sui.getObject(VAULT_REGISTRY_SUI);
  const totalDebt = Number(registrySUI.fields.total_vault_debt) / 1e9; 
  api.add(ADDRESSES.sui.DORI, totalDebt);
}

async function staking(api) {
  const stakingObj = await sui.getObject(STABILITY_POOL_SUI);
  const doriStaked = Number(stakingObj.fields.total_dori_balance);
  api.add(ADDRESSES.sui.DORI, doriStaked);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
    borrowed,
    staking
  },
};
