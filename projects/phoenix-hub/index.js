const utils = require("../helper/utils");
const {toUSDTBalances} = require("../helper/balances");

async function tvl() {
    // Fetch all tickers
    const response = await utils.fetchURL("https://stats.phoenix-hub.io/api/tvl");
    const data = response.data;
    
    if (data.success && data.data && typeof data.data.total_tvl_usd === 'number') {
      return toUSDTBalances(data.data.total_tvl_usd);
    } else {
      throw new Error("Invalid data format");
    }
}

module.exports = {
    methodology: 'counts the liquidity on all Phoenix Hub AMM Pools.',
    stellar: {
        tvl,
    }
};
