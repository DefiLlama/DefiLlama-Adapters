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
    ['2022-05-07', "UST depeg"],
    ['2022-01-27', "0xSifu revealed as QuadrigaCX founder"],
    ['2022-11-07', "FTX collapse, Alameda repays FTT loans"],
  ]


Object.keys(chainIds).forEach(chain => {
    module.exports[chain] = { tvl: chainTvl(chain) }
  })