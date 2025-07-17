const sdk = require("@defillama/sdk");
const {
  getAccountAllResources,
  invokeViewFunction,
  COIN_INFO_STRUCT_TYPE,
} = require("../helper/chain/supra");
const { transformBalances } = require("../helper/portedTokens");
const coreTokensAll = require("../helper/coreAssets.json");

const DEXLYN_LP_ACCOUNT_ADDRESS =
  "0x22a28a1b5264935d4778d542b1e84bca8879cf78f6183e1a9429b56a40a1a7c4";
const GET_POOL_RESERVE_SIZE_FUNCTION_TYPE =
  "0x0dc694898dff98a1b0447e0992d0413e123ea80da1021d464a4fbaf0265870d8::liquidity_pool::get_reserves_size";

const singleLevelStructTypeToStr = (structType) => {
  return `0x${structType.address.match(new RegExp(`[^${0}].*`))?.[0] || ""}::${
    structType.module
  }::${structType.name}`;
};

const calculateDexlynTVL = async (api) => {
  let accountResources = await getAccountAllResources(
    DEXLYN_LP_ACCOUNT_ADDRESS
  );
  let chain = api.chain;
  const coreTokens = Object.values(coreTokensAll[chain] ?? {});
  let balances = {};

  for (const resource of accountResources) {
    if (resource[0].includes(COIN_INFO_STRUCT_TYPE)) {
      let xCoinType = singleLevelStructTypeToStr(
        resource[1].type_args[0].struct.type_args[0].struct
      );
      let yCoinType = singleLevelStructTypeToStr(
        resource[1].type_args[0].struct.type_args[1].struct
      );
      let curveType = singleLevelStructTypeToStr(
        resource[1].type_args[0].struct.type_args[2].struct
      );

      let isCoreAssetX = coreTokens.includes(xCoinType);
      let isCoreAssetY = coreTokens.includes(yCoinType);
      if (isCoreAssetX || isCoreAssetY) {
        let [reserveX, reserveY] = await invokeViewFunction(
          GET_POOL_RESERVE_SIZE_FUNCTION_TYPE,
          [xCoinType, yCoinType, curveType],
          []
        );
        if (isCoreAssetX && isCoreAssetY) {
          sdk.util.sumSingleBalance(balances, xCoinType, reserveX);
          sdk.util.sumSingleBalance(balances, yCoinType, reserveY);
        } else if (isCoreAssetX) {
          sdk.util.sumSingleBalance(balances, xCoinType, reserveX * 2);
        } else if (isCoreAssetY) {
          sdk.util.sumSingleBalance(balances, yCoinType, reserveY * 2);
        }
      }
    }
  }
  return transformBalances(chain, balances);
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  supra: {
    tvl: calculateDexlynTVL,
  },
};