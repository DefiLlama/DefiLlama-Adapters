const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');

const api = "https://api.uxd.fi/api/uxd-circulating-supply";

async function tvl() {
    const result = (await axios.get(api)).data;
    return toUSDTBalances(result);
}

module.exports = {
    misrepresentedTokens: true,
    solana: {
        tvl
    }
}