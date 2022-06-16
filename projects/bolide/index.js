const retry = require('./helper/retry')
const axios = require("axios");

async function fetch() {
    var response = await retry(async bail => await axios.get('https://bolide.fi/api/tvl'))

    return response.data.total;
};

module.exports = {
    timetravel: true,
    methodology: 'Total value locked is a sum of all deposits people do',
    fetch,
};
