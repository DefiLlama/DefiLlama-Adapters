const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    const {data: {tvl}} = await retry(async () => await axios.get('http://localhost:3004/defi-llama/tvl'));

    return tvl;
}

module.exports = {
    fetch
}
