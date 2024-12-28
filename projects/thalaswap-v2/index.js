const { function_view } = require("../helper/chain/aptos");

const thalaswapLensAddress = "ff1ac437457a839f7d07212d789b85dd77b3df00f59613fcba02388464bfcacb";

async function getPools(lensAddress) {
  return function_view({ functionStr: `${lensAddress}::lens::get_all_pools_info`})
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: {
    tvl: async (api) => {
      const poolInfos = await getPools(thalaswapLensAddress)
      
      for (const poolInfo of poolInfos) {
        const assets = poolInfo.assets_metadata.map(asset => asset.inner)
        const balances = poolInfo.balances
        api.add(assets, balances)
      }
    },
  },
};