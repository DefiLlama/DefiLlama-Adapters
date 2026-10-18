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
    deadFrom: "2026-10-01", // abandoned?
    timetravel: false,
    misrepresentedTokens: true,
    algorand: {
        tvl
    }
}

