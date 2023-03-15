const { get } = require('./helper/http')
async function fetch() {
    return (
        await get("https://api.pact.fi/api/pools/all?ordering=-tvl_usd")
    ).map(p => p.tvl_usd).reduce((a, b) => a + parseFloat(b), 0);
}

module.exports = {
    algorand: {
        fetch
    },
    fetch
};