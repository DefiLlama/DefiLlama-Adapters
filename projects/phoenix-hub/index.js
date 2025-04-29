const utils = require("../helper/utils");
const {toUSDTBalances} = require("../helper/balances");

async function tvl() {
    // Fetch all tickers
    const tickers = await utils.fetchURL("https://api-phoenix-v2.decentrio.ventures/tickers");

    // Sum up the tvl
    const totalTVL = tickers.data.reduce((acc, t) => acc + (t.liquidity_in_usd > 0 ? t.liquidity_in_usd : 0), 0);
    return toUSDTBalances(totalTVL);
}

module.exports = {
    methodology: 'counts the liquidity on all Phoenix Hub AMM Pools.',
    stellar: {
        tvl,
    }
};
