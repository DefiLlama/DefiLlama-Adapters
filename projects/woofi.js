const BigNumber = require('bignumber.js');
const { fetchURL } = require('./helper/utils')
const { usdtAddress, toUSDTBalances } = require('./helper/balances')

function fetchTVL(network) {
    return async() => {
        let wooPP = await fetchWooPP(network)()
        let earn = await fetchEarn(network)()

        return {[usdtAddress]: parseFloat(
            BigNumber(wooPP[usdtAddress])
            .plus(BigNumber(earn[usdtAddress]))
        )}
    }
}

function fetchWooPP(network) {
    return async () => {
        let tvl = 0
        let data = await fetchURL('https://fi-api.woo.org/wooracle_state?network=' + network)
        Object.entries(data.data.data).forEach(([_, tokenInfo]) => {
            tvl += parseFloat(BigNumber(tokenInfo.balance).times(BigNumber(tokenInfo.price_now)).div(1e36))
        })
        return toUSDTBalances(tvl)
    }
}

function fetchStake(network) {
    return async () => {
        let data = await fetchURL('https://fi-api.woo.org/wooracle_state?network=' + network)
        let wooPrice
        if (network == 'avax') {
            wooPrice = BigNumber(data.data.data['WOO.e'].price_now)
        } else {
            wooPrice = BigNumber(data.data.data.WOO.price_now)
        }
        data = await fetchURL('https://fi-api.woo.org/staking?network=' + network)
        return toUSDTBalances(parseFloat(BigNumber(data.data.data.woo.total_staked).times(wooPrice).div(1e36)))
    }
}

function fetchEarn(network) {
    return async () => {
        let data = await fetchURL('https://fi-api.woo.org/yield?network=' + network)
        return toUSDTBalances(parseFloat(BigNumber(data.data.data.total_deposit).div(1e18)))
    }
}

module.exports={
    bsc: {
        tvl: fetchTVL('bsc'),
        staking: fetchStake('bsc'),
    },
    avax: {
        tvl: fetchTVL('avax'),
        staking: fetchStake('avax'),
    },
}
