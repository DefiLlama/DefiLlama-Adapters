const { get } = require('./helper/http')


async function fetch() {
    const global_data = await get("https://api.pact.fi/api/global_stats")
    return parseFloat(global_data.tvl)
}


module.exports = {
    algorand: {
        fetch
    },
    fetch
};