const { function_view } = require("../helper/chain/aptos");
const { get } = require('./helper/http')

const thalaswapLensAddress = "ff1ac437457a839f7d07212d789b85dd77b3df00f59613fcba02388464bfcacb";

async function getPool(lensAddress, lptAddress) {
  const args = [lptAddress];
  return function_view({ functionStr: `${lensAddress}::lens::get_pool_info`, args });
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: {
    tvl: async (api) => {
      // Fetch pool data from API
      const { data: { data: poolsData } } = await get('https://app.thala.fi/api/liquidity-pools');

      // Filter for V2 pools and get lptAddresses
      const v2Pools = poolsData.filter(pool => pool.metadata.isV2);
      
      for (const pool of v2Pools) {
        const poolInfo = await getPool(thalaswapLensAddress, pool.metadata.lptAddress);
        const assets = poolInfo.assets_metadata.map(asset => asset.inner);
        const balances = poolInfo.balances;
        api.add(assets, balances);
      }
    },
  },
};