const utils = require('../helper/utils')
const sdk = require('@defillama/sdk')
const staking = require('../helper/staking')

const chains = ['polygon', 'celo', 'moonriver', 'bsc', 'avax', 'xdai', 'ethereum', 'heco', 'okexchain', 'palm', 'arbitrum', 'fantom', 'harmony']
const endpoint = "https://sushi-analytics-defi.herokuapp.com/"

async function tvl(){
    const data = await utils.fetchURL(endpoint)
    const balances = {}
    Object.values(data.data).forEach(chain=>
        Object.entries(chain).forEach(balance=>
            sdk.util.sumSingleBalance(balances, balance[0], balance[1])
        )
    )
    return balances
}

const chainTvls = chains.reduce((obj, chain)=>{
    obj[chain === 'avax'?'avalanche':chain]={
        tvl: async()=>{
            const data = await utils.fetchURL(endpoint)
            return data.data[chain]
        }
    }
    return obj
}, {})

const xSUSHI = "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272"
const SUSHI = "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"

module.exports = {
    misrepresentedTokens: true,
    staking:{
        tvl: staking(xSUSHI, SUSHI, 'ethereum')
    },
    ...chainTvls,
    tvl
}