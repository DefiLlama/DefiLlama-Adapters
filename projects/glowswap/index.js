const { fetchURL } = require("../helper/utils");

async function tvl() {
    const response = await fetchURL('https://api.glowswap.io/v1/analytics')
    const data = response.data.data.pureTvlUSD.now
    return { 'usd-coin': data };

}
module.exports = {
    timetravel: true,
    bsquared:{
        tvl:tvl,
    }
}   