const ADDRESSES = require('../helper/coreAssets.json')
const {
  invokeViewFunction,
} = require("../helper/chain/supra");

const CDP_GET_TOTAL_STATS_FUNCTION_TYPE =
  "0x81846514536430ea934c7270f86cf5b067e2a2faef0e91379b4f284e91c7f53c::vault_core::total_assets";

const calculateSolidoFlowTVL = async (api) => {
  const SUPRA = ADDRESSES.supra.SUPRA;
  const totalCollateral = await invokeViewFunction(
    CDP_GET_TOTAL_STATS_FUNCTION_TYPE,
    [SUPRA],
    []
  );
  api.add(SUPRA, totalCollateral);
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: {
    tvl: calculateSolidoFlowTVL,
  },
};
