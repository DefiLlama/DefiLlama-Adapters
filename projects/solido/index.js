const {
  invokeViewFunction,
} = require("../helper/chain/supra");

const { transformBalances } = require("../helper/portedTokens");
const CDP_GET_TOTAL_STATS_FUNCTION_TYPE =
  "0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::cdp_multi::get_total_stats";
const CONVERT_TO_ASSETS_FUNCTION_TYPE="0x81846514536430ea934c7270f86cf5b067e2a2faef0e91379b4f284e91c7f53c::vault_core::convert_to_assets";
const calculateSolidoTVL = async (api) => {
  const chain = api.chain;
  const collateralTokens =[
    '0x1::supra_coin::SupraCoin',
    '0x81846514536430ea934c7270f86cf5b067e2a2faef0e91379b4f284e91c7f53c::vault_core::VaultShare'
  ]
  let balances = {};
  let totalCollateral_in_supra=0;
  const [SUPRA_TVL,SUPRA_DEBT] = await invokeViewFunction(
    CDP_GET_TOTAL_STATS_FUNCTION_TYPE,
    [collateralTokens[0]],
    []
  );
  const [stSUPRA_TVL,stSUPRA_DEBT] = await invokeViewFunction(
    CDP_GET_TOTAL_STATS_FUNCTION_TYPE,
    [collateralTokens[1]],
    []
  );
  const stSUPRA_TVL_in_supra = await invokeViewFunction(
    CONVERT_TO_ASSETS_FUNCTION_TYPE,
    [collateralTokens[0]],
    [stSUPRA_TVL]
  );
  totalCollateral_in_supra = BigInt(SUPRA_TVL) + BigInt(stSUPRA_TVL_in_supra[0]);
  balances={ '0x1::supra_coin::SupraCoin': totalCollateral_in_supra }
  return transformBalances(chain, balances);
};
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: {
    tvl: calculateSolidoTVL,
  },
};

