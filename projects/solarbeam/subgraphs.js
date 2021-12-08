const {getChainTvl} = require('../helper/getUniSubgraphTvl')

const chainTvl = getChainTvl({
    moonriver: "https://analytics.solarbeam.io/api/subgraph"
})

module.exports={
    moonriver:{
        tvl: chainTvl('moonriver')
    }
}