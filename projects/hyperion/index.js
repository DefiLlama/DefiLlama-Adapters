const { function_view } = require("../helper/chain/aptos");
const { get } = require("../helper/http");

const HYPERION = "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c";
// hyperion's own pool list: per pool tvlUSD, the two tokens (pool order) and their metadata
const POOL_LIST = "https://assets.hyperion.xyz/files/pool-list-new.json";
// pools below this (per hyperion's list) are skipped; ~40 of ~350 pools hold >99.9% of tvl
const MIN_POOL_TVL_USD = 100;

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology: `Counts the token reserves of Hyperion pools, read on-chain (pool_v3::pool_reserve_amount); pools Hyperion lists below $${MIN_POOL_TVL_USD} TVL are skipped.`,
  aptos: {
    tvl: async (api) => {
      const { data: list } = await get(POOL_LIST);
      const pools = list.filter(({ tvlUSD }) => Number(tvlUSD) >= MIN_POOL_TVL_USD).map(({ pool }) => pool);
      api.log(`Hyperion pools counted: ${pools.length} of ${list.length} listed`);

      // FA tokens paired with a legacy coin are priced under the coin type
      const token = (info, fa) => info?.coinType ?? fa;
      for (const pool of pools) {
        const [reserve1, reserve2] = await function_view({
          functionStr: `${HYPERION}::pool_v3::pool_reserve_amount`,
          args: [pool.poolId],
          type_arguments: [],
        });
        api.add(token(pool.token1Info, pool.token1), reserve1);
        api.add(token(pool.token2Info, pool.token2), reserve2);
      }
    },
  },
};
