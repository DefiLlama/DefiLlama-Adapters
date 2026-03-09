const { getResources, } = require("../helper/chain/aptos");

const moveDollarAddress = "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01";

let resourcesCache;

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources(moveDollarAddress)
  return resourcesCache
}
const extractVaultType = resource => resource.type.split('<')[1].replace('>', '').split(', ');
const vaultsFilter = resource => resource.type.includes(`${moveDollarAddress}::vault::Vaults<`)
const psmsFilter = resource => resource.type.includes(`${moveDollarAddress}::psm::PSM<`)

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates all collateral backing Move Dollar in Thala's CDP Vaults.",
  aptos: {
    tvl: async (api) => {
      const resources = await _getResources()
      const vaults = resources.filter(vaultsFilter).map(vault => ({
        total_collateral: vault.data.total_collateral,
        asset_type: extractVaultType(vault),
      }));
      const psms = resources.filter(psmsFilter).map(psm => ({
        total_collateral: psm.data.coin.value,
        asset_type: extractVaultType(psm),
      }));
      vaults.forEach(({ asset_type, total_collateral }) => {
        api.add(asset_type.toString(), total_collateral);
      });
      psms.forEach(({ asset_type, total_collateral }) => {
        api.add(asset_type.toString(), total_collateral);
      });
    },
  },
};