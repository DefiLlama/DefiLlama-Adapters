const sdk = require("@defillama/sdk");
const {
  invokeViewFunction,
} = require("../helper/chain/supra");
const { transformBalances } = require("../helper/portedTokens");
const coreTokensAll = require("../helper/coreAssets.json");

const CDP_GET_TOTAL_STATS_FUNCTION_TYPE =
  "0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::cdp_multi::get_total_stats";
  
const calculateSolidoTVL = async (api) => {
  const chain = api.chain;
  const coreTokens = Object.values(coreTokensAll[chain] ?? {});
  let balances = {};

  // For each supported collateral type, get total stats
  for (const coinType of coreTokens) {
    try {
      const [totalCollateral, totalDebt] = await invokeViewFunction(
        CDP_GET_TOTAL_STATS_FUNCTION_TYPE,
        [coinType],
        []
      );
      if (totalCollateral > 0) {
        sdk.util.sumSingleBalance(balances, coinType, totalCollateral);
      }
    } catch (error) {
      // Skip if the coin type is not supported as collateral
      console.log(`Error getting stats for ${coinType}: ${error.message}`);
    }
  }

  return transformBalances(chain, balances);
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: {
    tvl: calculateSolidoTVL,
  },
};
