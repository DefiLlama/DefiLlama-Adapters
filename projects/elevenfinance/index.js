const retry = require('async-retry');
const axios = require('axios');

const apiUrl = 'https://eleven.finance/api.json';

async function fetch() {
    const res = await retry(async bail => await axios.get(apiUrl));
    const tvl = parseFloat(res.totalvaluelocked);
    return Math.round(tvl);
}

module.exports = {
    fetch,
}
