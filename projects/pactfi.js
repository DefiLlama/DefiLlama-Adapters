const { get } = require('./helper/http')
const { getConfig } = require('./helper/cache')



async function fetch() {
    await getConfig('pact-fi', 'https://api.pact.fi/api/internal/pools_details/all')
    const global_data = await get("https://api.pact.fi/api/global_stats")
    return parseFloat(global_data.tvl_usd)
}


module.exports = {
    algorand: {
        fetch
    },
    fetch
};