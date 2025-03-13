const { function_view } = require("../helper/chain/aptos");

const YUZU_CLMM_PACKAGE =
  "0x46566b4a16a1261ab400ab5b9067de84ba152b5eb4016b217187f2a2ca980c5a";

const getPoolIds = async chain => {
  const pools = await function_view({
    functionStr: `${YUZU_CLMM_PACKAGE}::liquidity_pool::get_all_pools`,
    type_arguments: [],
    args: [],
    chain
  });

  let poolIds = [];

  pools.forEach(pool => {
    poolIds.push(pool.inner);
  });

  return poolIds;
};

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in Yuzu CLMM.",
  move: {
    tvl: async api => {
      const poolIds = await getPoolIds(api.chain);

      for (let i = 0; i < poolIds.length; i++) {
        const resp = await function_view({
          functionStr: `${YUZU_CLMM_PACKAGE}::liquidity_pool::get_pool_view`,
          type_arguments: [],
          args: [poolIds[i]],
          chain: api.chain
        });

        api.add(resp.token_0, resp.token_0_reserve);
        api.add(resp.token_1, resp.token_1_reserve);
      }
    }
  }
};
