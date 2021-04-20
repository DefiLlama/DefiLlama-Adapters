const axios = require('axios')
const { toUSDTBalances } = require('../helper/balances')

async function tvl(timestamp) {
    if(Math.abs(timestamp-Date.now()/1000)<3600){
        const tvl = await axios.get('https://yearn.science/v1/tvl/latest')
        return toUSDTBalances(tvl.data.tvl)
    }
    const historicalTvls = Object.entries((await axios.get('https://yearn.science/v1/tvl')).data)
        .map(([date, tvl]) => [Date.parse(date)/1000, tvl]).sort(([date1], [date2]) => date1 - date2);
    let high = historicalTvls.length;
    let low = 0;
    while ((high - low) > 1) {
        const mid = Math.floor((high + low) / 2);
        const midTimestamp = historicalTvls[mid][0]
        if (midTimestamp < timestamp) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return toUSDTBalances(historicalTvls[low][1])
}


module.exports = {
    name: 'Yearn',
    token: 'YFI',
    category: 'yield',
    start: 1581552000,
    tvl,
};
