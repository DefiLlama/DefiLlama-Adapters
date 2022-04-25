const retry = require('async-retry');
const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');

function fetch(chain) {
    return async () => {
        let response = await retry(
            async bail => await axios.get(
                'https://api.tokensfarm.com/totals'
                )
            );
        return toUSDTBalances(response.data.totals.tvl[chain]);
    };
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    avax: {
        tvl: fetch('avalanche')
    },
    bsc: {
        tvl: fetch('binance')
    },
    ethereum: {
        tvl: fetch('ethereum')
    },
    fantom: {
        tvl: fetch('fantom')
    },
    polygon: {
        tvl: fetch('polygon')
    },
};