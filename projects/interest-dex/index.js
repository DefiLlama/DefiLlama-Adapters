const { function_view } = require("../helper/chain/aptos");

const INTEREST_V2_LENS_PACKAGE = '0x392afff1596101a33e86ac9465336a4ae2a176664352067b619c7aeef2085a8b';

const getAllV2Pools = async (chain) =>  function_view({ functionStr: `${INTEREST_V2_LENS_PACKAGE}::lens::getAllPools`, type_arguments: [], args: [], chain })

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in InterestV2's AMM.",
  move: {
    tvl: async (api) => {
      const allV2PoolsPage = await getAllV2Pools(api.chain);
      allV2PoolsPage.pools.forEach(pool => {
        api.add(pool.fa_x, pool.balance_x);
        api.add(pool.fa_y, pool.balance_y);
      });
    },
  },
};