const { function_view } = require("../helper/chain/aptos");
const { get } = require("../helper/http");

const HYPERION = "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c";
// hyperion's own pool list: per pool tvlUSD, the two tokens (pool order) and their metadata
const POOL_LIST = "https://assets.hyperion.xyz/files/pool-list-new.json";
// pools below this (per hyperion's list) are skipped; ~40 of ~350 pools hold >99.9% of tvl
const MIN_POOL_TVL_USD = 100;
const PAGE_SIZE = 100;

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology: `Counts the token reserves of Hyperion pools, read on-chain (pool_v3::all_pools_with_info); pools Hyperion lists below $${MIN_POOL_TVL_USD} TVL are skipped.`,
  aptos: {
    tvl: async (api) => {
      const { data: list } = await get(POOL_LIST);
      // FA tokens paired with a legacy coin are priced under the coin type
      const priceKey = {}
      const counted = new Set()
      for (const { tvlUSD, pool } of list) {
        if (Number(tvlUSD) < MIN_POOL_TVL_USD) continue
        counted.add(pool.poolId)
        priceKey[pool.token1] = pool.token1Info?.coinType ?? pool.token1
        priceKey[pool.token2] = pool.token2Info?.coinType ?? pool.token2
      }
      api.log(`Hyperion pools counted: ${counted.size} of ${list.length} listed`);

      // all_pools_with_info pages through every pool with its reserves, so a handful of
      // calls replace one pool_reserve_amount view per pool
      let seen = 0
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const [pools, page] = await function_view({
          functionStr: `${HYPERION}::pool_v3::all_pools_with_info`,
          args: [String(offset), String(PAGE_SIZE)],
          type_arguments: [],
        });
        for (const { pool, token_a, token_b, token_a_reserve, token_b_reserve } of pools) {
          if (!counted.has(pool.inner)) continue
          seen++
          api.add(priceKey[token_a.inner] ?? token_a.inner, token_a_reserve);
          api.add(priceKey[token_b.inner] ?? token_b.inner, token_b_reserve);
        }
        if (offset + pools.length >= +page.total || !pools.length) break
      }
      if (seen !== counted.size) api.log(`Hyperion: ${counted.size - seen} listed pools not found on-chain`)
    },
  },
};
