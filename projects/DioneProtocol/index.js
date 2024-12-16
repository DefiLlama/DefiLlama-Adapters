const { fetchURL } = require("../helper/utils");

/**
 * Calculates the Total Value Locked (TVL) for Dione Protocol on Odyssey network.
 * Uses DiamondSwap API to fetch the most recent day's TVL data.
 * @returns {Promise<Object>} An object with the TVL in 'dione'.
 */
async function tvl() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400;

    const response = await fetchURL(`https://prod-api.diamondswap.com/v6/dione/analytics/daily-tvl/1/${oneDayAgo}/${now}`);

    if (!response.data || !response.data.uniswapDayDatas || response.data.uniswapDayDatas.length === 0) {
      console.warn("No TVL data available from DiamondSwap API.");
      return { 'dione': 0 };
    }

    const latestTvlData = response.data.uniswapDayDatas[response.data.uniswapDayDatas.length - 1];
    const tvlValue = parseFloat(latestTvlData.totalLiquidityUSD);

    if (isNaN(tvlValue)) {
      console.warn("Invalid TVL value received.");
      return { 'dione': 0 };
    }

    return { 'dione': tvlValue };
  } catch (error) {
    console.error("Failed to fetch TVL:", error);
    return { 'dione': 0 };
  }
}

module.exports = {
  methodology: "TVL is calculated using the latest data from DiamondSwap's API, representing liquidity in pools. Updates are based on daily data points.",
  
  odyssey: {
    tvl,
  },

  timetravel: true,  

  start: 1729814400, // October 30, 2024, at 00:00:00 UTC, start of Odyssey migration

  hallmarks: [
    [1729814400, "Odyssey Migration"],
  ]
};