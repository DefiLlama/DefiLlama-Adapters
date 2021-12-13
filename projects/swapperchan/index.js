const { getChainTvl } = require('../helper/getUniSubgraphTvl');

const graphUrls = {
  boba: 'https://graph.mainnet.boba.network/subgraphs/name/swapperchan/exchange',
}
const chainTvl = getChainTvl(graphUrls, "factories", "liquidityUSD")

module.exports={
    boba:{
        tvl: chainTvl("boba")
    }
}
