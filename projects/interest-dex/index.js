const sdk = require("@defillama/sdk");
const { function_view } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

const INTEREST_V2_LENS_PACKAGE = '0x392afff1596101a33e86ac9465336a4ae2a176664352067b619c7aeef2085a8b';

const getAllV2Pools = async (chain) =>  function_view({ functionStr: `${INTEREST_V2_LENS_PACKAGE}::lens::getAllPools`, type_arguments: [], args: [], chain })

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in InterestV2's AMM.",
  move: {
    tvl: async (api) => {
      const allV2PoolsPage = await getAllV2Pools(api.chain);
      const netBalances = {};

      allV2PoolsPage.pools.forEach(pool => {
        sdk.util.sumSingleBalance(netBalances, pool.fa_x, pool.balance_x);
        sdk.util.sumSingleBalance(netBalances, pool.fa_y, pool.balance_y);
      });

      return transformBalances(api.chain, netBalances)
    },
  },
};