const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    const response = await retry(
        async () => await axios.get('https://tifi.net/api/dex/tvl')
    ).data;
    return response.total_tvl;
}

module.exports = {
    fetch
}