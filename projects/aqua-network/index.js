const utils = require("../helper/utils");
const { getApiTvl } = require("../helper/historicalApi");

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

async function current() {
  var aquaPoolsLiquidity = (
    await utils.fetchURL("https://amm-api.aqua.network/api/external/v1/statistics/totals/")
  ).data.items;

  const currentItem = findClosestDate(aquaPoolsLiquidity);

  return parseFloat(currentItem.tvl) / 10e7;
}

function tvl(time) {
  return getApiTvl(time, current, async () => {
    var dayData = (
        await utils.fetchURL("https://amm-api.aqua.network/api/external/v1/statistics/totals/")
    )
       
    return dayData.items.map((item) => ({
      date: new Date(item.date),
      totalLiquidityUSD: parseFloat(item.tvl) / 10e7,
    }));
  });
}

module.exports = {
  methodology:
    'TVL counts the liquidity of the Pools on AMM, data is pulled from the Aquarius API: "https://amm-api.aqua.network/api/external/v1/statistics/totals/".',
  stellar: {tvl},
};
