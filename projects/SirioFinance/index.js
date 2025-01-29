const { fetchURL } = require("../helper/utils")

async function fetch() {
    const res = await fetchURL("https://mainnet.service-api.sirio.finance/api/v1/markets/stats");
    return res.data.total_supply_usd;
}

module.exports = {
    timetravel: false,
    methodology: 'The calculated TVL is the current USD sum found under https://app.sirio.finance/analytics',
    fetch
}
