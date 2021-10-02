const {getChainTvl} = require('../helper/getUniSubgraphTvl')

module.exports={
    methodology: "Liquidity on DEX",
    tvl: getChainTvl({moonriver: "https://graph-node.huckleberry.finance/subgraphs/name/huckleberry/huckleberry-subgraph"})('moonriver')
}