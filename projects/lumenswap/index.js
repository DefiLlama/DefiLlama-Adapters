const utils = require("../helper/utils");
const { getApiTvl } = require("../helper/historicalApi");

async function current() {
  var tvlAllPools = (
    await utils.fetchURL("https://api.lumenswap.io/amm/known-pools")
  ).data.map((t) => t.tvl);
  let tvl = 0;
  for (let tvlPool of tvlAllPools) {
    tvl += parseFloat(tvlPool);
  }
  return tvl;
}

function tvl(time) {
  return getApiTvl(time, current, async () => {
    const dayData = await utils.fetchURL(
      "https://api.lumenswap.io/amm/stats/overall"
    );
    return dayData.data.map((d) => ({
      date: Math.round(new Date(d.periodTime).getTime() / 1e3),
      totalLiquidityUSD: d.tvl,
    }));
  });
}

module.exports = {
  methodology:
    'TVL counts the liquidity of the Pools on AMM, data is pulled from the Lumenswap API:"https://api.lumenswap.io/amm/known-pools".',
  tvl,
};
