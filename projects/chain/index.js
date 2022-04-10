const { fetchURL } = require('../helper/utils')
const { toUSDTBalances } = require('../helper/balances')

function chainTvl(url) {
    return async () => {
        const currentTime = (new Date()).getTime();
        url = url + 'startTime=' + currentTime + '&endTime=' + currentTime;
        console.log('url: ', url);
        let data = await fetchURL(url)
        
        data = data.data;
        let tvl = 0
        if (data.data.length > 0) {
            tvl = data.data[data.data.length - 1].usd;
        }
        return toUSDTBalances(tvl);
    }
}

const tvlURL = "https://api.chain.xyz/staking/tvl?"
module.exports={
    methodology: "TVL calculated by total staked XCN amount in staking pool based on XCN USD price.",
    ethereum:{
        tvl: chainTvl(tvlURL),
    },
}
