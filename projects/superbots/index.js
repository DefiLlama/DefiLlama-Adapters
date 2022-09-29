const retry = require('async-retry');
const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');

function fetch() {
    return async () => {
        let response = await retry(
            async bail => await axios.get(
                'https://app.superbots.finance/api/vaults/all'
                )
            );
        const tvl = response.data.reduce((acc, vault) => acc + (vault.tvl || 0), 0)
        return toUSDTBalances(tvl);
    };
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    bsc: {
        tvl: fetch()
    }
}