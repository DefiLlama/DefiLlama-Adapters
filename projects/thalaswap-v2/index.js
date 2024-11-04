const sdk = require("@defillama/sdk");
const { getResource, function_view } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const thalaswapAddress = "0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5";
const thalaswapControllerResource = `${thalaswapAddress}::pool::ThalaSwap`;
let resourcesCache;

async function _getResource(address, key) {
  if (!resourcesCache) resourcesCache = getResource(address, key)
  return resourcesCache
}
async function getBalance(poolAddress, assetMetadata) {
  return function_view({ functionStr: "0x1::primary_fungible_store::balance", type_arguments: ["0x1::fungible_asset::Metadata"], args: [poolAddress, assetMetadata] });
}
const extractCoinAddress = resource => resource.type.split('<')[1].replace('>', '').split(', ');
const poolsFilter = resource => resource.type.includes(`${thalaswapAddress}::stable_pool::StablePool<`) || resource.type.includes(`${thalaswapAddress}::weighted_pool::WeightedPool<`)
module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: {
    tvl: async () => {
      const balances = {};
      const controller = await _getResource(thalaswapAddress, thalaswapControllerResource)
      console.log(controller)
      
      const poolObjects = controller.pools.inline_vec.map(pool => (pool.inner))
      console.log(poolObjects)

      for (const poolAddress of poolObjects) {
        const pool = await getResource(poolAddress, `${thalaswapAddress}::pool::Pool`)
        const assets = pool.assets_metadata.map(asset => asset.inner)
        for (const asset of assets) {
          const balance = await getBalance(poolAddress, asset)
          sdk.util.sumSingleBalance(balances, asset, balance);
        }
      }
      console.log(balances)
      return transformBalances("aptos", balances);
    },
  },
};