const { get } = require('../helper/http')
const {toUSDTBalances} = require('../helper/balances')

async function fetch(chainName) {
    return 0
    // const {tvlMap} = await get('https://app.earnmos.fi/defi-llama/tvl-map');

    // return toUSDTBalances(tvlMap[chainName]);
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    evmos: {
        tvl: fetch.bind(null, 'evmos')
    },
    kava: {
        tvl: fetch.bind(null, 'kava')
    }
}
