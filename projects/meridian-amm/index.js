const sdk = require("@defillama/sdk");
const { getResource, function_view } = require("../helper/chain/movement");
const { transformBalances } = require("../helper/portedTokens");

const thalaswapAddress = "fbdb3da73efcfa742d542f152d65fc6da7b55dee864cd66475213e4be18c9d54";
const thalaswapControllerResource = `${thalaswapAddress}::pool::MeridianAMM`;
let resourcesCache;

async function _getResource(address, key) {
  if (!resourcesCache) resourcesCache = getResource(address, key)
  return resourcesCache
}
async function getBalance(poolAddress, assetMetadata) {
  return function_view({ functionStr: "0x1::primary_fungible_store::balance", type_arguments: ["0x1::fungible_asset::Metadata"], args: [poolAddress, assetMetadata] });
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Meridian's AMM.",
  aptos: {
    tvl: async () => {
      const balances = {};
      const controller = await _getResource(thalaswapAddress, thalaswapControllerResource)
      
      const poolObjects = controller.pools.inline_vec.map(pool => (pool.inner))

      for (const poolAddress of poolObjects) {
        const pool = await getResource(poolAddress, `${thalaswapAddress}::pool::Pool`)
        const assets = pool.assets_metadata.map(asset => asset.inner)
        for (const asset of assets) {
          const balance = await getBalance(poolAddress, asset)
          sdk.util.sumSingleBalance(balances, asset, balance);
        }
      }

      return transformBalances("movement", balances);
    },
  },
};