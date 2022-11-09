const retry = require('async-retry')
const axios = require("axios");
const {toUSDTBalances} = require('../helper/balances')

async function fetch(chainName) {
    const {data: {tvlMap}} = await retry(async () => await axios.get('https://app.earnmos.fi/defi-llama/tvl-map'));

    return toUSDTBalances(tvlMap[chainName]);
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    evmos: {
        tvl: fetch.bind(null, 'evmos')
    },
    kava: {
        tvl: fetch.bind(null, 'kava')
    }
}
