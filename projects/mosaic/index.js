const { function_view } = require("../helper/chain/aptos");

// Constants
const MOSAIC_AMM_PACKAGE =
  "0x26a95d4bd7d7fc3debf6469ff94837e03e887088bef3a3f2d08d1131141830d3";
const GET_ALL_POOLS_FUNCTION = `${MOSAIC_AMM_PACKAGE}::liquidity_pool::all_pools`;
const GET_POOL_VIEW_FUNCTION = `${MOSAIC_AMM_PACKAGE}::liquidity_pool::get_pool_view`;

/**
 * Retrieves all pool IDs from Mosaic AMM contract
 * @param {string} chain - The blockchain name
 * @returns {Promise<Array<string>>} - Array of pool IDs
 */
const getPoolIds = async chain => {
  const pools = await function_view({
    functionStr: GET_ALL_POOLS_FUNCTION,
    type_arguments: [],
    args: [],
    chain
  });

  return pools.map(pool => pool.inner);
};

/**
 * Fetches data for a specific pool
 * @param {string} poolId - Pool identifier
 * @param {string} chain - The blockchain name
 * @returns {Promise<Object>} - Pool data
 */
const getPoolData = async (poolId, chain) => {
  return await function_view({
    functionStr: GET_POOL_VIEW_FUNCTION,
    type_arguments: [],
    args: [poolId],
    chain
  });
};

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL of Mosaic AMM.",
  move: {
    tvl: async api => {
      const poolIds = await getPoolIds(api.chain);

      // Process pools in parallel for better performance
      const poolDataPromises = poolIds.map(id => getPoolData(id, api.chain));
      const poolsData = await Promise.all(poolDataPromises);

      // Add token reserves to TVL
      poolsData.forEach(pool => {
        if (pool) {
          api.add(pool.token_x, pool.token_x_reserve);
          api.add(pool.token_y, pool.token_y_reserve);
        }
      });
    }
  }
};
