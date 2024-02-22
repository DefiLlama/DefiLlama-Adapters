const { fetchURL } = require("../helper/utils");

async function tvl() {
    const response = await fetchURL('https://api.moriprotocol.io/v1/analytics')
    const data = response.data.data.tvlUSD.now
    console.log('tvl:',data)
    return { 'usd-coin': data };

}
module.exports = {
    timetravel: true,
    tomochain:{
        tvl:tvl,
    }
}   