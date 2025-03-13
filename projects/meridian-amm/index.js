const sdk = require("@defillama/sdk");
const { function_view } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const meridianLensAddress = "23e71cc9821bbe85404ab9850694cd319701687265bb18740af067843fc81f1e";

async function getPools(lensAddress) {
  return function_view({ functionStr: `${lensAddress}::lens::get_all_pools_info`, type_arguments: [], args: [], chain: 'move' })
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Meridian's AMM.",
  move: {
    tvl: async (api) => {
      const poolInfos = await getPools(meridianLensAddress)
      const netBalances = {};
      
      for (const poolInfo of poolInfos) {
        const assets = poolInfo.assets_metadata.map(asset => asset.inner)
        const balances = poolInfo.balances
        
        for (let i = 0; i < assets.length; i++) {
            sdk.util.sumSingleBalance(netBalances, assets[i], balances[i]);
        }
      }

      return transformBalances(api.chain, netBalances)
    },
  },
};