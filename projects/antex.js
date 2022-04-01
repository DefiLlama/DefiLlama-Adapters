const retry = require('./helper/retry');
const axios = require("axios");

async function fetch() {
    let response = await retry(
        async bail => await axios.get(
            'https://antex.finance/api/token/statistic?platform=bsc&network=main'
        )
    );
    return response.data.data.total_liquid_lock;
};

module.exports = {
    timetravel: false,
    bsc: {
        fetch,
    }
};