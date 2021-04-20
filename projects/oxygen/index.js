const axios = require("axios")
const { toUSDTBalances } = require('../helper/balances');

const endpoint = "https://history-api.oxygen.org/oxygen-history/public/api/v1/protocols/FUa77Li8RJAn28dQZJvYb9Xb5mmMRQbXN2eA5Q6pU4h7/pools?pageNumber=1&pageSize=1000&sortDirection=DESC&sortField=CREATED_AT&showZeroBalance=false"
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'

async function tvl() {
    const pools = await axios.get(endpoint)
    const tvl = pools.data.data.reduce((acc, pool)=>{
        return acc+pool.assetValue-pool.liabilityValue
    }, 0)
    return toUSDTBalances(tvl)
}

module.exports = {
    solana: {
        tvl,
    },
    timeTravelUnsupported: true,
    tvl
}