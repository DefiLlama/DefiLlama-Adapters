const axios = require('axios');
const retry = require('../helper/retry');
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
    const response = (
        await retry(
            async () => await axios.get(
                'https://api.cometa.farm/stats/tvl'
            )
        )
    )

    return toUSDTBalances(response.data.total);
}

module.exports = {
    timetravel: false,
    algorand: {
        tvl
    }
}

