const { function_view } = require("../helper/chain/aptos");
const { PromisePool } = require('@supercharge/promise-pool')
const coreAssets = require('../helper/coreAssets.json')

// Constants
const YUZU_CLMM_PACKAGE =
  "0x46566b4a16a1261ab400ab5b9067de84ba152b5eb4016b217187f2a2ca980c5a";
const GET_ALL_POOLS_FUNCTION = `${YUZU_CLMM_PACKAGE}::liquidity_pool::get_all_pools`;
const GET_POOL_VIEW_FUNCTION = `${YUZU_CLMM_PACKAGE}::liquidity_pool::get_pool_view`;
// Native MOVE coin is priced as 0xa on Movement chain
const MOVE_NATIVE = "0xa";

/**
 * Retrieves all pool IDs from Yuzu CLMM contract
 * @param {string} chain - The blockchain name
 * @returns {Promise<Array<string>>} - Array of pool IDs
 */
const getPoolIds = async chain => {
  try {
    const pools = await function_view({
      functionStr: GET_ALL_POOLS_FUNCTION,
      type_arguments: [],
      args: [],
      chain
    });

    return pools.map(pool => pool.inner);
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
    return await function_view({
      functionStr: GET_POOL_VIEW_FUNCTION,
      type_arguments: [],
      args: [poolId],
      chain
    });
  } catch (error) {
    console.error(`Error fetching data for pool ${poolId}: ${error.message}`);
    return null;
  }
};

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in Yuzu CLMM.",
  move: {
    tvl: async api => {
      const poolIds = await getPoolIds(api.chain);

      const poolsData = await PromisePool
        .withConcurrency(10)
        .for(poolIds)
        .process(id => getPoolData(id, api.chain))

      // Only a handful of Movement tokens have prices on DefiLlama. For pools
      // where exactly one side is a priced core asset, double-count that side
      // so the pool's full TVL is reflected (same approach as dexExport).
      const coreTokens = new Set([
        MOVE_NATIVE,
        ...Object.values(coreAssets[api.chain] ?? {}),
      ]);

      poolsData.results.forEach(pool => {
        if (!pool) return;
        const isCore0 = coreTokens.has(pool.token_0);
        const isCore1 = coreTokens.has(pool.token_1);
        const nonNegligible = pool.token_0_reserve !== '0' && pool.token_1_reserve !== '0';

        if (isCore0 && isCore1) {
          api.add(pool.token_0, pool.token_0_reserve);
          api.add(pool.token_1, pool.token_1_reserve);
        } else if (isCore0) {
          api.add(pool.token_0, pool.token_0_reserve);
          if (nonNegligible) api.add(pool.token_0, pool.token_0_reserve);
        } else if (isCore1) {
          api.add(pool.token_1, pool.token_1_reserve);
          if (nonNegligible) api.add(pool.token_1, pool.token_1_reserve);
        }
      });
    }
  }
};
