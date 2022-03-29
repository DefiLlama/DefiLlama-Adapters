const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    let response = await retry(async bail => await axios.get('https://api.tokensfarm.com/totals'))
    let tvl = response.data.totals.tvl;

    return tvl;
}

module.exports = {
    fetch
}
