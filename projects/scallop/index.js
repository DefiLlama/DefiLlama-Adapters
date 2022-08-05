const axios = require('axios');
const retry = require('async-retry')

async function fetch() {
    const response = (
        await retry(
            async () => await axios.get('https://api.scallop.io/v1/get-total-value')
        )
    ).data;

    return response.data;
}

module.exports = {
    timetravel: false,
    solana: {
        fetch
    },
    fetch,
};