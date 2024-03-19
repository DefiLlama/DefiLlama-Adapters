const { wavesBalanceDetails, assetBalance, scriptEvaluate, dataSearch, mapAssetIdToCG } = require("../helper/chain/waves");
const sdk = require('@defillama/sdk')

const WXStakingNode = "3P3RZeHi4LTjpZdpw7kmkVSbQ84qDfrVy8G";

const WXStakingWxTokenContract = "3PJL8Hn8LACaSBWLQ3UVhctA5cTQLBFwBAP";
const WXAssetId = "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on";

const factoryContract = "3PCuHsTU58WKhCqotbcSwABvdPzqqVAbbTv";
const WXPoolsRestContract = "3P8MoPnsaurofk1VyhsdAFkeQ6ijpJYXCpW";

async function wavesTVL() {
  const balances = {};
  const { effective } = await wavesBalanceDetails(WXStakingNode);
  sdk.util.sumSingleBalance(balances,'waves', effective / 1e8)
  return balances;
}

async function WXTVL() {
  const balances = await wavesTVL();
  const { balance } = await assetBalance(WXStakingWxTokenContract, WXAssetId);
  sdk.util.sumSingleBalance(balances,'waves-exchange', balance / 1e8);
  return balances;
}

// WX pool detail
async function getPoolDetail(restContract, lpAssetId) {
  const data = (await scriptEvaluate(restContract, `poolStatsREADONLY("${lpAssetId}")`)).result.value['_2'].value;
  const [,amountAssetBalance, priceAssetBalance, poolLPBalance, , lpPriceInAmountAsset, lpPriceInPriceAsset, poolWeight] = data.split('__');
  return {
    amountAssetBalance: Number(amountAssetBalance),
    priceAssetBalance: Number(priceAssetBalance),
    poolLPBalance: Number(poolLPBalance),
    lpPriceInAmountAsset: Number(lpPriceInAmountAsset),
    lpPriceInPriceAsset: Number(lpPriceInPriceAsset),
    poolWeight: Number(poolWeight)
  };
}

// Get WX pools
async function getPoolsData(factoryContract, restContract) {
  const result = await dataSearch(factoryContract, ".*__config");

  // Get pools from waves data state
  const pools = result.reduce((acc, { value }) => {
    const [ ,poolAddress, poolStatus, lpAssetId, amountAssetId, priceAssetId, amountAssetDecimals, priceAssetDecimals, , ,LPAssetDecimals, poolType ] = value.split('__');
    
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
  const poolsData = await pools.reduce(async (acc, pool) => {
    const data = await acc;
    const poolDetails = await getPoolDetail(restContract, pool.lpAssetId);
    data.push({
      ...pool,
      ...poolDetails
    });
    return data;
  }, Promise.resolve([])); 

  return poolsData;
}

async function WXPoolsTVL() {
  const poolData = await getPoolsData(factoryContract, WXPoolsRestContract);
  const balances = {};

  poolData.forEach(pool => {
    const priceAssetCgId = mapAssetIdToCG(pool.priceAssetId);
    const amountAssetCgId = mapAssetIdToCG(pool.amountAssetId);

    const isStable = pool.poolType !== 'VLTPOOL';
    if (priceAssetCgId && amountAssetCgId) {
      sdk.util.sumSingleBalance(balances, priceAssetCgId.cgId, pool.priceAssetBalance / pool.priceAssetDecimals);
      sdk.util.sumSingleBalance(balances, amountAssetCgId.cgId, pool.amountAssetBalance / pool.amountAssetDecimals);
    } else if (priceAssetCgId && !isStable) {
      sdk.util.sumSingleBalance(balances, priceAssetCgId.cgId, pool.priceAssetBalance / pool.priceAssetDecimals * 2);
    } else if(amountAssetCgId && !isStable) {
      sdk.util.sumSingleBalance(balances, amountAssetCgId.cgId, pool.amountAssetBalance / pool.amountAssetDecimals * 2);
    }
  });

  return balances;
}


module.exports = {
  timetravel: false, // Waves blockchain
  methodology: "WX liqudity pools summ of tokens in staking, WAVES staking (WX Waves mainer node), WX staking governance token",
  waves: {
    tvl: async () => ({}),
    staking: WXTVL,
    pool2: WXPoolsTVL
  },
};
