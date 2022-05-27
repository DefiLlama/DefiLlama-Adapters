const {getChainTvl} = require('../helper/getUniSubgraphTvl')

const chainTvl = getChainTvl({
    moonriver: "https://api.thegraph.com/subgraphs/name/solarbeamio/amm-v2"
})

module.exports={
    moonriver:{
        tvl: chainTvl('moonriver')
    }
}