const retry = require('async-retry')
const axios = require("axios");
const CAKE_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=pancakeswap-token&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"

async function fetch() {
    var cake_tvl = await retry(async bail => axios.get("https://api.minimax.finance/tvl/cake"));
    var price_feed = await retry(async bail => await axios.get(CAKE_PRICE_URL));
    var tvl = parseFloat(cake_tvl.data.TotalTvl) * price_feed.data['pancakeswap-token'].usd;
    return tvl;
}

module.exports = {
    fetch
}