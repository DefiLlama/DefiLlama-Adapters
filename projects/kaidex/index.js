const {getChainTvl} = require('../helper/getUniSubgraphTvl')

module.exports={
    kardia:{
        tvl: getChainTvl({
            kardia: 'https://ex-graph.kardiachain.io/subgraphs/name/kai/exchange-v2'
        }, 'kaiDexFactories')('kardia')
    }
}