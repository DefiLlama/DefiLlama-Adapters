const ADDRESSES = require('../helper/coreAssets.json')
const { invokeViewFunction } = require("../helper/chain/supra");

const { transformBalances } = require("../helper/portedTokens");

const CDP_GET_TOTAL_STATS_FUNCTION_TYPE =
  "0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::cdp_multi::get_total_stats";

const SUPRA_ADDR = ADDRESSES.supra.SUPRA;
const STSUPRA_ADDR =
  "0x81846514536430ea934c7270f86cf5b067e2a2faef0e91379b4f284e91c7f53c::vault_core::VaultShare";

const calculateSolidoTVL = async (api) => {
  const chain = api.chain;
  let balances = {};

  // Fetch native SUPRA collateral
  const [SUPRA_TVL] = await invokeViewFunction(
    CDP_GET_TOTAL_STATS_FUNCTION_TYPE,
    [SUPRA_ADDR],
    []
  );
  balances[SUPRA_ADDR] = BigInt(SUPRA_TVL);

  const [stSUPRA_TVL] = await invokeViewFunction(
    CDP_GET_TOTAL_STATS_FUNCTION_TYPE,
    [STSUPRA_ADDR],
    []
  );
  balances[STSUPRA_ADDR] = BigInt(stSUPRA_TVL);

  return transformBalances(chain, balances);
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: {
    tvl: calculateSolidoTVL,
  },
};
