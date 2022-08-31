const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
        const response = (
            await retry(
                async (bail) => await axios.get('https://serum-volume-tracker.vercel.app/')
            )
        ).data;

        const tvl = response.tvl;

        return tvl
}

module.exports = {
    timetravel: false,
    fetch,
};
