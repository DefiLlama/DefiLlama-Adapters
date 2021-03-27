const axios = require('axios')
const BigNumber = require('bignumber.js')

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'

async function tvl(timestamp) {
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
    return {
        [usdtAddress]: BigNumber(historicalTvls[low][1]).times(1e6).toFixed(0)
    }
}


module.exports = {
    name: 'Yearn',
    token: 'YFI',
    category: 'yield',
    start: 1581552000,
    tvl,
};
