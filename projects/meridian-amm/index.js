const sdk = require("@defillama/sdk");
const { getResource, function_view } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const thalaswapAddress = "0xfbdb3da73efcfa742d542f152d65fc6da7b55dee864cd66475213e4be18c9d54";
const thalaswapControllerResource = `${thalaswapAddress}::pool::MeridianAMM`;

async function getBalance(poolAddress, assetMetadata) {
  return function_view({ functionStr: "0x1::primary_fungible_store::balance", type_arguments: ["0x1::fungible_asset::Metadata"], args: [poolAddress, assetMetadata], chain: 'move' });
}

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in Meridian's AMM.",
  move: {
    tvl: async (api) => {
      const balances = {};
      const controller = await getResource(thalaswapAddress, thalaswapControllerResource, api.chain)

      const poolObjects = controller.pools.inline_vec.map(pool => (pool.inner))

      for (const poolAddress of poolObjects) {
        const pool = await getResource(poolAddress, `${thalaswapAddress}::pool::Pool`, api.chain)
        const assets = pool.assets_metadata.map(asset => asset.inner)
        for (const asset of assets) {
          const balance = await getBalance(poolAddress, asset)
          sdk.util.sumSingleBalance(balances, asset, balance);
        }
      }

      return transformBalances(api.chain, balances);
    },
  },
};