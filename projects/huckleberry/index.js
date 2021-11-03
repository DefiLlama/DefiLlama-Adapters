const {getChainTvl} = require('../helper/getUniSubgraphTvl')
const { staking } = require('../helper/staking')

module.exports={
    methodology: "Liquidity on DEX",
    moonriver:{
        staking: staking("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "moonriver"),
        tvl: getChainTvl({moonriver: "https://graph-node.huckleberry.finance/subgraphs/name/huckleberry/huckleberry-subgraph"})('moonriver')
    }
}