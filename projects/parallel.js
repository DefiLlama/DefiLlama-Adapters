const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
        const response = (
            await retry(
                async (bail) => await axios.get('https://auction-service-prod.parallel.fi/crowdloan/total-value')
            )
        ).data;

        const tvl = response.totalValue;

        return tvl
}

module.exports = {
    timetravel: false,
    fetch,
};
