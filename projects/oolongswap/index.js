const {getChainTvl} = require('../helper/getUniSubgraphTvl')

module.exports={
    boba:{
        tvl: getChainTvl({boba: "https://api.thegraph.com/subgraphs/name/oolongswap/oolongswap-mainnet"})("boba")
    }
}