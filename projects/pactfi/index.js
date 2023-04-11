const { get } = require('../helper/http')

async function fetch() {
    const global_data = await get("https://api.pact.fi/api/global_stats")
    return parseFloat(global_data.tvl)
}


async function staking() {
    const data = (await get("https://api.pact.fi/api/farms/all")).map(p => p.tvl_usd).reduce((a, b) => a + parseFloat(b), 0);
    return data //Float value in USD
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    algorand: {
        staking: staking,
        fetch
    },
    fetch
};