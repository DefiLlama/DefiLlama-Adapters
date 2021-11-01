const {getChainTvl} = require('../helper/getUniSubgraphTvl')

const tvl = getChainTvl({
    'moonriver': 'https://graph.moonfarm.in/subgraphs/name/moonswap'
})

module.exports={
    tvl: tvl('moonriver'),
    methodology: "We get the tvl from the subgraph at graph.moonfarm.in/subgraphs/name/moonswap, it only includes liquidity on the DEX"
}