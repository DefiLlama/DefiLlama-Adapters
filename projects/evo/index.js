const { invokeViewFunction } = require("../helper/chain/supra");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Constants
const EVO_CLMM_PACKAGE = "0x6511aa4c617887b8eb34608484424d4fb98cf30cd15479e38c1aa4fb8a61bcb9";
const GET_ALL_POOLS_FUNCTION = `${EVO_CLMM_PACKAGE}::evo_clamm_liquidity_pool::get_all_pools`;
const GET_POOL_VIEW_FUNCTION = `${EVO_CLMM_PACKAGE}::evo_clamm_liquidity_pool::get_pool_view`;

// Returns all pool Ids from the EVO CLMM contract
const getPoolIds = async () => {
  const pools = await invokeViewFunction(GET_ALL_POOLS_FUNCTION, [], []);
  return pools[0].map(pool => pool.inner);
};

// Returns pool data by pool Id
const getPoolData = async (poolId) => {
  const result = await invokeViewFunction(GET_POOL_VIEW_FUNCTION, [], [poolId]);
  return result[0];
};

const tvl = async (api) => {
  const poolIds = await getPoolIds();
  for (const id of poolIds) {
    const data = await getPoolData(id);
    api.add(data.token_0, data.token_0_reserve);
    api.add(data.token_1, data.token_1_reserve);
  }
  return sumTokens2({ api })
}

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in EVO CLMM.",
  supra: { tvl }
};