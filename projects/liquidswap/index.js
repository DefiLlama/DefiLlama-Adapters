const { getChainTvl } = require("../helper/getUniSubgraphTvl");

module.exports={
    timetravel: true,
    methology: "We are counting all the liquidity on their DEX as TVL, data is sourced from the subgraph at 'https://subgraph.liquidchain.net/subgraphs/name/liquid/exchange'",
    liquidchain:{
        tvl: getChainTvl({
            liquidchain: "https://subgraph.liquidchain.net/subgraphs/name/liquid/exchange"
        }, "pancakeFactories")('liquidchain')
    }
}