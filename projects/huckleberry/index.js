const {getChainTvl} = require('../helper/getUniSubgraphTvl')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    methodology: "Liquidity on DEX",
    moonriver:{
        staking: stakingPricedLP("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "moonriver", "0xbBe2f34367972Cb37ae8dea849aE168834440685", "moonriver"),
        tvl: getChainTvl({moonriver: "https://graph-node.huckleberry.finance/subgraphs/name/huckleberry/huckleberry-subgraph"})('moonriver')
    }
}