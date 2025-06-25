
const sui = require("../helper/chain/sui");
const ADDRESSES = require("../helper/coreAssets.json");

const VAULT_REGISTRY_SUI = "0xa16f2aef5db003653344700dec7a8151ba6bf029db6bbf8d70025f5a55ff042e"; // Vault Registry SUI type address

async function tvl(api) {
  // Collateral in vaults (SUI)
  const registrySUI = await sui.getObject(VAULT_REGISTRY_SUI);
  const totalCollateralSUI = Number(registrySUI.fields.total_collateral) / 1e9;
  api.add(ADDRESSES.sui.SUI, totalCollateralSUI);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};
