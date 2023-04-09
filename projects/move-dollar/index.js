const sdk = require("@defillama/sdk");
const { getResources, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const moveDollarAddress = "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01";

let resourcesCache;

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources(moveDollarAddress)
  return resourcesCache
}
const extractVaultType = resource => resource.type.split('<')[1].replace('>', '').split(', ');
const vaultsFilter = resource => resource.type.includes(`${moveDollarAddress}::vault::Vaults<`)

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates all collateral backing Move Dollar in Thala's CDP Vaults.",
  aptos: {
    tvl: async () => {
      const balances = {};
      const resources = await _getResources()
      const vaults = resources.filter(vaultsFilter).map(vault => ({
          total_collateral: vault.data.total_collateral,
          asset_type: extractVaultType(vault),
        }));

      vaults.forEach(({ asset_type, total_collateral }) => {
          sdk.util.sumSingleBalance(balances, asset_type, total_collateral);
      });

      return transformBalances("aptos", balances);
    },
  },
};