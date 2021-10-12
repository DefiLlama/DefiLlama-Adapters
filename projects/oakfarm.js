const { fetchURL } = require('./helper/utils')
const { toUSDTBalances } = require('./helper/balances')

function chainTvl(url, pool2, staking) {
    return async () => {
        const data = await fetchURL(url)
        let tvl = 0
        Object.entries(data.data.data).forEach(([name, poolData]) => {
            const poolTvl = poolData.total_deposit
            if (name.includes('okf')) {
                if(name.includes('lp')){
                    if(pool2){
                        tvl+=poolTvl
                    }
                } else{
                    if(staking){
                        tvl+=poolTvl
                    }
                }
            } else {
                if(!staking && !pool2){
                    tvl+=poolTvl
                }
            }
        })
        return toUSDTBalances(tvl)
    }
}

const oecUrl = "https://api.oakfarm.io/vault?network=oec"
const bscUrl = "https://api.oakfarm.io/vault?network=bsc"
module.exports={
    methodology: "OakFarm is Yield for users to earn by APY, it supplies an fToken as certificate and vault share price for user to withdraw their token. Therefore, We use Web3.py fetching the balance of fToken and share price, also with the token usd price to calculate the TVL.",
    okexchain:{
        tvl: chainTvl(oecUrl, false, false),
        staking: chainTvl(oecUrl, false, true),
        pool2: chainTvl(oecUrl, true, false),
        masterchef: chainTvl(oecUrl, false, false),
    },
    bsc:{
        tvl: chainTvl(bscUrl, false, false),
        staking: chainTvl(bscUrl, false, true),
        pool2: chainTvl(bscUrl, true, false),
        masterchef: chainTvl(bscUrl, false, false),
    },
}
