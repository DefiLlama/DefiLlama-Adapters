const {getExports} = require('../helper/heroku-api')
const {staking} = require('../helper/staking')

const chains = ['polygon', 'celo', 'moonriver', 'bsc', 'avax', 'xdai', 'ethereum', 'heco', 'okexchain', 'palm', 'arbitrum', 'fantom', 'harmony']

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"

module.exports = {
    misrepresentedTokens: true,
    staking:{
        tvl: staking(xSUSHI, SUSHI, 'ethereum')
    },
    ...getExports("sushi", chains)
}