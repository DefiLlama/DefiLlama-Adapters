const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
    try {
        const response = (
            await retry(
                async (bail) => await axios.get('https://api.serum-data.com/tvl')
            )
        ).data;

        const tvl = response.result.tvl;

        return tvl || 0;
    } catch (e) {
        return 0;
    }
}

module.exports = {
    fetch,
};
