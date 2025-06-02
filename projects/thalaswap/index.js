const { getResources, } = require("../helper/chain/aptos");

const thalaswapAddress = "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af";
const nullCoinType = "base_pool::Null";

let resourcesCache;

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources(thalaswapAddress)
  return resourcesCache
}
const extractCoinAddress = resource => resource.type.split('<')[1].replace('>', '').split(', ');
const poolsFilter = resource => resource.type.includes(`${thalaswapAddress}::stable_pool::StablePool<`) || resource.type.includes(`${thalaswapAddress}::weighted_pool::WeightedPool<`)
module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: {
    tvl: async (api) => {
      const resources = await _getResources()
      const pools = resources.filter(poolsFilter).map(pool => ({
          assets: [pool.data.asset_0, pool.data.asset_1, pool.data.asset_2, pool.data.asset_3],
          asset_types: extractCoinAddress(pool),
        }));

      pools.forEach(({ assets, asset_types }) => {
        assets.forEach((asset, index) => {
          // We ignore the null coin because it signifies that we don't have either a third or fourth asset in the pool
          // We  ignore the THL coin because native tokens are exempt from TVL calculations
          if (!asset_types[index].includes(nullCoinType))
            api.add(asset_types[index], asset.value);
        });
      });
    },
  },
};