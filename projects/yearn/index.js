const axios = require('axios')
const BigNumber = require('bignumber.js')

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const toUSDT = value => BigNumber(value).times(1e6).toFixed(0)

async function tvl(timestamp) {
    if(Math.abs(timestamp-Date.now()/1000)<3600){
        const tvl = await axios.get('https://yearn.science/v1/tvl/latest')
        return{
            [usdtAddress]:toUSDT(tvl.data.tvl)
        }
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
    return {
        [usdtAddress]: toUSDT(historicalTvls[low][1])
    }
}


module.exports = {
    name: 'Yearn',
    token: 'YFI',
    category: 'yield',
    start: 1581552000,
    tvl,
};
