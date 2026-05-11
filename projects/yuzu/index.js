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
// Yuzu stores sqrt_price as floor(sqrt(price) * 2^80), where price is raw token_1 / raw token_0.
// See https://docs.yuzu.finance/technical/smart-contracts/yuzu-clmm/example-usage/tick-math-module
const Q160 = 2n ** 160n;

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
  methodology: "Aggregates TVL across all Yuzu CLMM pools. For pools where only one side is a priced core asset, the unpriced side's reserves are converted into the priced token's units using the pool's current sqrt_price so concentrated, skewed CLMM reserves are accounted for correctly.",
  move: {
    tvl: async api => {
      const poolIds = await getPoolIds(api.chain);

      const poolsData = await PromisePool
        .withConcurrency(10)
        .for(poolIds)
        .process(id => getPoolData(id, api.chain))

      // Most Movement tokens are not priced by DefiLlama. For pools where only
      // one side is a priced core asset, convert the unpriced side into the
      // priced token's units using the pool's current sqrt_price. This is
      // CLMM-correct (works regardless of how skewed the reserves are) since
      // we use the on-chain spot price rather than assuming balanced reserves.
      const coreTokens = new Set([
        MOVE_NATIVE,
        ...Object.values(coreAssets[api.chain] ?? {}),
      ]);

      poolsData.results.forEach(pool => {
        if (!pool) return;
        const r0 = BigInt(pool.token_0_reserve);
        const r1 = BigInt(pool.token_1_reserve);
        if (r0 === 0n && r1 === 0n) return;

        const isCore0 = coreTokens.has(pool.token_0);
        const isCore1 = coreTokens.has(pool.token_1);

        if (isCore0 && isCore1) {
          api.add(pool.token_0, r0.toString());
          api.add(pool.token_1, r1.toString());
          return;
        }
        if (!isCore0 && !isCore1) return;

        const sp = BigInt(pool.current_sqrt_price);
        if (sp === 0n) return;
        const spSq = sp * sp; // sp^2 ; raw_price = spSq / 2^160

        if (isCore0) {
          // r1 raw token_1 == r1 / raw_price raw token_0 == r1 * 2^160 / sp^2
          const r1AsR0 = (r1 * Q160) / spSq;
          api.add(pool.token_0, (r0 + r1AsR0).toString());
        } else {
          // r0 raw token_0 == r0 * raw_price raw token_1 == r0 * sp^2 / 2^160
          const r0AsR1 = (r0 * spSq) / Q160;
          api.add(pool.token_1, (r1 + r0AsR1).toString());
        }
      });
    }
  }
};
