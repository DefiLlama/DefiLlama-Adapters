const { toUSDTBalances } = require('./helper/balances');
const { get } = require('./helper/http');

async function fetch() {
    let response = await get(
        'https://antpad.io/api/index/statistic?platform=bsc&network=main'
    )
    return toUSDTBalances(response.data.total_liquidity_locked);
};

module.exports = {
    timetravel: false,
    bsc: {
        tvl: fetch,
    }
};