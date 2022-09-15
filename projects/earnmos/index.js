const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    const {data: {tvl}} = await retry(async () => await axios.get('https://app.earnmos.fi/defi-llama/tvl'));

    return tvl;
}

module.exports = {
    fetch
}
