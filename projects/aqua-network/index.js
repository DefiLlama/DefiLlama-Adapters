const utils = require("../helper/utils");
const { getApiTvl } = require("../helper/historicalApi");

const AQUA_STATS_URL = "https://amm-api.aqua.network/api/external/v1/statistics/totals/?size=all"

function findClosestDate(items) {
  const currentDate = new Date().getTime();

  let closestItem = null;
  let closestDiff = Infinity;

  for (let item of items) {
    const itemDate = new Date(item.date).getTime();
    const diff = Math.abs(currentDate - itemDate);

    if (diff < closestDiff) {
      closestItem = item;
      closestDiff = diff;
    }
  }

  return closestItem;
}

function getCurrent(aquaHistoricalData) {
  const currentItem = findClosestDate(aquaHistoricalData);
  return parseFloat(currentItem.tvl) / 10e7;
}

function getDayData(aquaHistoricalData)  {
  return aquaHistoricalData.map((item) => ({
    date: new Date(item.date).getTime() / 1e3,
    totalLiquidityUSD: parseFloat(item.tvl) / 10e7,
  }));
}

async function tvl(time) {
  var aquaHistoricalData = (
    await utils.fetchURL(AQUA_STATS_URL)
  ).data;

  return getApiTvl(
    time,
    () => getCurrent(aquaHistoricalData),
    () => getDayData(aquaHistoricalData)
  );
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'counts the liquidity of the Pools on AMM, data is pulled from the Aquarius API: "https://amm-api.aqua.network/api/external/v1/statistics/totals/".',
  stellar: { tvl },
  start: 1719792000,
};