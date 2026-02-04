const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require("@defillama/sdk");
const {
  invokeViewFunction,
} = require("../helper/chain/supra");
const { transformBalances } = require("../helper/portedTokens");
const GROW_GET_TOTAL_STATS_FUNCTION_TYPE =
  "0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::vault_core::total_assets";
const CASH = "0x9176f70f125199a3e3d5549ce795a8e906eed75901d535ded623802f15ae3637::cdp_multi::CASH";
const SUPRA = ADDRESSES.supra.SUPRA;
const DEXLYN_ROUTER_FUCNTION_TYPE="0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::router::get_amount_out";
const CURVE="0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::curves::Uncorrelated";
  
const calculateGrowTVL = async (api) => {
  const chain = api.chain;
  let balances = {};
  const totalCASH = await invokeViewFunction(
    GROW_GET_TOTAL_STATS_FUNCTION_TYPE,
    [CASH],
    []
  );
  // Use 1 CASH (1e8) for price discovery
  const oneCASH = "100000000";
  const get_amount_out = await invokeViewFunction(
    DEXLYN_ROUTER_FUCNTION_TYPE,
    [CASH, SUPRA, CURVE],
    [oneCASH]
  );
  // Calculate total SUPRA value: price per CASH * totalCASH / 1e8
  const supraAmount = (BigInt(get_amount_out) * BigInt(totalCASH)) / 100000000n;
  if (supraAmount > 0) {
    sdk.util.sumSingleBalance(balances, SUPRA, supraAmount.toString());
  }
  return transformBalances(chain, balances);
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: {
    tvl: calculateGrowTVL,
  },
};

