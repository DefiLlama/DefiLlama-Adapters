const { toUSDTBalances } = require('../helper/balances');
const { get } = require('../helper/http')

async function tvl() {
    const response = (
        await get(
                'https://api.cometa.farm/stats/tvl'
            )
    )

    return toUSDTBalances(response.total);
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    algorand: {
        tvl
    }
}

