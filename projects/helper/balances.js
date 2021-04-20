const BigNumber = require('bignumber.js')

const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const toUSDT = value => BigNumber(value).times(1e6).toFixed(0)
const toUSDTBalances = value => ({
    [usdtAddress]:toUSDT(value)
})

module.exports = {
    toUSDT,
    toUSDTBalances,
    usdtAddress
}