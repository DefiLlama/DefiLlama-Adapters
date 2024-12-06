const { get } = require("../helper/http");

async function tvl() {
  const analyticsData = await get("https://api-general.compx.io/api/analytics");
  
  // Extract relevant TVL data from the new API response
  const tokenStreamTvl = analyticsData.tokenStreamTVL.amount || 0;
  const farmsTvl = analyticsData.farmsTVL || 0;
  const cdpTvl = analyticsData.cdpAnalytics.tvl || 0;
  const stakingTvl = analyticsData.stakingAnalytics.totalTvl || 0;

  // Calculate total TVL in USD
  const totalTvlUsd = tokenStreamTvl + farmsTvl + cdpTvl + stakingTvl;

  return { tether: totalTvlUsd };
}

module.exports = {
  algorand: {
    tvl,
  },
};