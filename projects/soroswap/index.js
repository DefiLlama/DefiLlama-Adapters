const utils = require("../helper/utils");
const { getApiTvl } = require("../helper/historicalApi");

const getCurrentTvl = (pools) => {
  return pools?.data?.reduce((acc, pool) => {
    return acc + (pool.tvl || 0);
  }, 0);
};

const getTvlDayData = (pools) => {
  const tvlChartData = {};

  pools?.data?.forEach((pool) => {
    pool.tvlChartData?.forEach((data) => {
      tvlChartData[data.date] = {
        tvl: (tvlChartData?.[data?.date]?.tvl || 0) + data.tvl,
        date: data.date,
      };
    });
  });

  return Object.keys(tvlChartData).map((key) => ({
    date: tvlChartData[key].date,
    totalLiquidityUSD: tvlChartData[key].tvl,
  }));
};

async function tvl(time) {
  const pools = await utils.fetchURL(
    "https://info.soroswap.finance/api/pairs?network=MAINNET"
  );

  return getApiTvl(
    time,
    () => getCurrentTvl(pools),
    () => getTvlDayData(pools)
  );
}

module.exports = {
  methodology:
    'TVL counts the liquidity of the Pools on AMM, data is pulled from the Soroswap Info: "https://info.soroswap.finance/".',
  stellar: { tvl },
};
