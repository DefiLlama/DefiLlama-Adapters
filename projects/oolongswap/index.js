const {getChainTvl} = require('../helper/getUniSubgraphTvl')

module.exports={
    boba:{
        tvl: getChainTvl({boba: "https://graph.mainnet.boba.network/subgraphs/name/oolongswap/mainnet"})("boba")
    }
}