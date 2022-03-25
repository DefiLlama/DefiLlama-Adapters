const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    var cake_tvl = await retry(async bail => axios.get("https://api.minimax.finance/tvl"));
    var tvl = parseFloat(cake_tvl.data.TvlTotal);
    return tvl;
}

module.exports = {
    fetch
}