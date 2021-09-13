const utils = require('../helper/utils')
const sdk = require('@defillama/sdk')

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
    obj[chain]={
        tvl: async()=>{
            const data = await utils.fetchURL(endpoint)
            return data.data[chain]
        }
    }
    return obj
}, {})

module.exports = {
    misrepresentedTokens: true,
    ...chainTvls,
    tvl
}