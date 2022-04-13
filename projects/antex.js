const retry = require('./helper/retry');
const axios = require("axios");
const { toUSDTBalances } = require('./helper/balances');

async function fetch() {
    let response = await retry(
        async bail => await axios.get(
            'https://antex.finance/api/token/statistic?platform=bsc&network=main'
        )
    );
    return toUSDTBalances(response.data.data.total_liquid_lock);
};

module.exports = {
    timetravel: false,
    bsc: {
        tvl: fetch,
    }
};