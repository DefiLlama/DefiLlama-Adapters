const { function_view } = require("../helper/chain/aptos");

const INTEREST_CURVE_LENS_PACKAGE = '0x44fce812d2fa8a7ab2322e693c0861113894a32a475e8596fa9a6592b214f5db';

const getAllCurvePools = async (chain) =>  function_view({ functionStr: `${INTEREST_CURVE_LENS_PACKAGE}::lens::getAllPools`, type_arguments: [], args: [], chain })

module.exports = {
  timetravel: false,
  methodology:
    "Aggregates TVL in all pools in Interest Curve AMM.",
  move: {
    tvl: async (api) => {
      const allCurvePoolsPage = await getAllCurvePools(api.chain);
      allCurvePoolsPage.forEach(pool => {
        pool.fas.forEach((fa, index) => {
          api.add(fa, pool.balances[index]);
        });
      });
    },
  },
};