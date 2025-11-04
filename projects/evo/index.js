const { invokeViewFunction } = require("../helper/chain/supra");

// Constants
const EVO_CLMM_PACKAGE =
  "0x3a56a0fcb8f23212fe880485c206dd03e08011ae88f02dbf9d0842be99eeac4b";
const GET_ALL_POOLS_FUNCTION = `${EVO_CLMM_PACKAGE}::evo_clamm_liquidity_pool::get_all_pools`;
const GET_POOL_VIEW_FUNCTION = `${EVO_CLMM_PACKAGE}::evo_clamm_liquidity_pool::get_pool_view`;

/**
 * Retrieves all pool IDs from EVO CLMM contract
 * @param {string} chain - The blockchain name
 * @returns {Promise<Array<string>>} - Array of pool IDs
 */
const getPoolIds = async chain => {
  try {
    const pools = await invokeViewFunction(
      GET_ALL_POOLS_FUNCTION,
      [],
      []
    );
    return pools[0].map(pool => pool.inner);
  } catch (error) {
    console.error(`Error fetching pool IDs: ${error.message}`);
    return [];
  }
};

/**
 * Fetches data for a specific pool
 * @param {string} poolId - Pool identifier
 * @param {string} chain - The blockchain name
 * @returns {Promise<Object|null>} - Pool data or null if error
 */
const getPoolData = async (poolId, chain) => {
  try {
    const result = await invokeViewFunction(
      GET_POOL_VIEW_FUNCTION,
      [],
      [poolId]
    );
    return result[0];
  } catch (error) {
    console.error(`Error fetching data for pool ${poolId}: ${error.message}`);
    return null;
  }
};

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in EVO CLMM.",
  supra: {
    tvl: async api => {
      const poolIds = await getPoolIds(api.chain);
      console.log("poolIds: ", poolIds)
      // Process pools in parallel for better performance
      const poolDataPromises = poolIds.map(id => getPoolData(id, api.chain));
      const poolsData = await Promise.all(poolDataPromises);

      console.log("poolsData: ", poolsData)

      // Add token reserves to TVL
      poolsData.forEach(pool => {
        if (pool) {
          console.log('Adding token:', pool.token_0, 'with reserve:', pool.token_0_reserve);
          api.add(pool.token_0, pool.token_0_reserve);
          console.log('Adding token:', pool.token_1, 'with reserve:', pool.token_1_reserve);
          api.add(pool.token_1, pool.token_1_reserve);
        }
      });

      console.log('Final balances:', api.getBalances());
    }
  }
};