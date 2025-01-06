const { scriptEvaluate, dataSearch, assetBalance } = require("../helper/chain/waves");
const { transformDexBalances } = require("../helper/portedTokens");

const sdk = require('@defillama/sdk')

const factoryContract = "3PCuHsTU58WKhCqotbcSwABvdPzqqVAbbTv";
const WXPoolsRestContract = "3P8MoPnsaurofk1VyhsdAFkeQ6ijpJYXCpW";

async function getPoolDetail(restContract, lpAssetId) {
  const data = (await scriptEvaluate(restContract, `poolStatsREADONLY("${lpAssetId}")`)).result.value['_2'].value;
  const [, amountAssetBalance, priceAssetBalance, poolLPBalance, , lpPriceInAmountAsset, lpPriceInPriceAsset, poolWeight] = data.split('__');
  return {
    amountAssetBalance: Number(amountAssetBalance),
    priceAssetBalance: Number(priceAssetBalance),
    poolLPBalance: Number(poolLPBalance),
    lpPriceInAmountAsset: Number(lpPriceInAmountAsset),
    lpPriceInPriceAsset: Number(lpPriceInPriceAsset),
    poolWeight: Number(poolWeight)
  };
}

async function getPoolsData(factoryContract, restContract, api) {
  const result = await dataSearch(factoryContract, ".*__config");

  // Get pools from waves data state
  const pools = result.reduce((acc, { value }) => {
    const [, poolAddress, poolStatus, lpAssetId, amountAssetId, priceAssetId, amountAssetDecimals, priceAssetDecimals, , , LPAssetDecimals, poolType] = value.split('__');

    if (Number(poolStatus) > 2) {
      return acc;
    }

    acc.push({
      poolAddress,
      poolStatus: Number(poolStatus),
      lpAssetId,
      amountAssetId,
      priceAssetId,
      amountAssetDecimals: Number(amountAssetDecimals),
      priceAssetDecimals: Number(priceAssetDecimals),
      LPAssetDecimals: Number(LPAssetDecimals),
      poolType
    });
    return acc;
  }, []);

  //Get pools balances
  const data = []
  for (const pool of pools) {
    const poolDetails = await getPoolDetail(restContract, pool.lpAssetId);
    const isStable = pool.poolType !== 'VLTPOOL'
    if (isStable) {
      api.add(pool.amountAssetId, poolDetails.amountAssetBalance)
      api.add(pool.priceAssetId, poolDetails.priceAssetBalance)
    } else {
      data.push({
        token0: pool.amountAssetId,
        token1: pool.priceAssetId,
        token0Bal: poolDetails.amountAssetBalance,
        token1Bal: poolDetails.priceAssetBalance,
      })
    }
  }

  return transformDexBalances({ api, data, });
}

async function WXPoolsTVL(api) {
  return getPoolsData(factoryContract, WXPoolsRestContract, api);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false, // Waves blockchain
  methodology: "TVL of WX means the quantity of staked tokens in WX liqudity pools",
  waves: {
    staking,
    tvl: WXPoolsTVL,
  },
};

async function staking() {
  const WXStakingWxTokenContract = "3PJL8Hn8LACaSBWLQ3UVhctA5cTQLBFwBAP";
  const WXAssetId = "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on";
  const balances = {};
  const { balance } = await assetBalance(WXStakingWxTokenContract, WXAssetId);
  sdk.util.sumSingleBalance(balances, 'waves-exchange', balance / 1e8);
  return balances;
}