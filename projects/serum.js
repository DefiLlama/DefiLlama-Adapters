const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
        const response = (
            await retry(
                async (bail) => await axios.get('https://api.serum-data.com/tvl')
            )
        ).data;

        const tvl = response.result.tvl;

        return tvl
}

module.exports = {
    fetch,
};
