const {getChainTvl} = require('../helper/getUniSubgraphTvl')

const tvl = getChainTvl({
    'moonriver': 'https://api.thegraph.com/subgraphs/name/moonfarmin/moonswap-dex'
})

module.exports={
    tvl: tvl('moonriver'),
    methodology: "We get the tvl from the subgraph at graph.moonfarm.in/subgraphs/name/moonswap, it only includes liquidity on the DEX"
} // node test.js projects/moonswap/index.js