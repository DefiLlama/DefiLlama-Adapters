const { getConfig } = require("../helper/cache");
const { function_view } = require("../helper/chain/aptos");
const { get } = require('../helper/http')
const { PromisePool } = require('@supercharge/promise-pool')

const thalaswapLensAddress = "ee8c71b117851371fb180928cd73e4f111b04b0efbebb0054b9b29c8d5fec96c";

async function getPool(lensAddress, lptAddress) {
  const args = [lptAddress];
  return function_view({ functionStr: `${lensAddress}::lens::get_pool_info`, args });
}

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Thalaswap CL, Thala Labs' AMM.",
  aptos: {
    tvl: async (api) => {
      // Fetch pool data from API
      const { data: poolsData } = await getConfig('thalaswap-v3', 'https://app.thala.fi/api/liquidity-pools');

      // Filter for V3 pools and get lptAddresses
      const v3Pools = poolsData.filter(pool => pool.metadata.version === 3);

      const { errors } = await PromisePool.for(v3Pools)
        .withConcurrency(2)
        .process(async (pool) => {
          const poolInfo = await getPool(thalaswapLensAddress, pool.metadata.lptAddress);
          const assets = [poolInfo.metadata_0.inner, poolInfo.metadata_1.inner];
          const balances = [poolInfo.balance_0, poolInfo.balance_1];
          api.add(assets, balances);
        });
      
      // Handle errors
      if (errors?.length > 0) {
        console.error("Errors occurred while processing pools:", errors);
        throw errors[0];
      }
    },
  },
};