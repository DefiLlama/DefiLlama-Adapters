const {fetchChainExports} = require('../helper/exports')
const {fetchURL} = require('../helper/utils')

const endpoint = "https://analytics.abracadabra.money/api/statistic/tvl"

const chainIds = {
    ethereum: 1,
    //bsc: 56,
    fantom: 250,
    arbitrum: 42161,
    avax: 43114
}

function chainTvl(chain){
    return async()=>{
        const data = await fetchURL(endpoint)
        return data.data.networks[chainIds[chain]]
    }
}

module.exports = fetchChainExports(chainTvl, Object.keys(chainIds))