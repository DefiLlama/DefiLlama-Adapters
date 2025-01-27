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

module.exports.misrepresentedTokens = true;
module.exports.hallmarks = [
    [1651881600, "UST depeg"],
    [1643245200, "0xSifu revealed as QuadrigaCX founder"],
    [1667826000, "FTX collapse, Alameda repays FTT loans"],
  ]


Object.keys(chainIds).forEach(chain => {
    module.exports[chain] = { tvl: chainTvl(chain) }
  })