const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    var tvl_data = await retry(async bail => axios.get("https://api.minimax.finance/tvl"));
    var tvl = parseFloat(tvl_data.data.TvlTotal);
    return tvl;
}

module.exports = {
    fetch
}