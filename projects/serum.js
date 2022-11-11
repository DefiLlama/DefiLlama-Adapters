const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
        const response = (
            await retry(
                async (bail) => await axios.get('https://serum-volume-tracker.vercel.app/')
            )
        ).data;

        const blacklisted = ['MTGX']
        const tvl = response.markets
            .filter(i => !blacklisted.includes(i.quote_symbol) && !blacklisted.includes(i.base_symbol))
            .reduce((a, i) => a + i.total_liquidity, 0)

        return tvl
}

module.exports = {
    timetravel: false,
    fetch,
};
