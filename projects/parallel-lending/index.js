const retry = require('../helper/retry');
const axios = require('axios');

async function fetch() {
        const response = (
            await retry(
                async (bail) => await axios.get('https://analytics.parallel.fi/api/tvl?details=true')
            )
        ).data;

        const tvl = response.products.moneyMarket;

        return tvl
}

module.exports = {
    timetravel: false,
    fetch,
};
