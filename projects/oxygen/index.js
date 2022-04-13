const axios = require("axios")
const { toUSDTBalances } = require('../helper/balances');

const endpoint = "https://history-api.oxygen.org/oxygen-history/public/api/v1/market-data/tvl"

async function tvl() {
    const tvl = (await axios.get(endpoint)).data
    return toUSDTBalances(tvl)
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    solana: {
        tvl,
    },
}
