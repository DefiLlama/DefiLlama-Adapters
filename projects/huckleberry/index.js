    const {getChainTvl} = require('../helper/getUniSubgraphTvl')
const { stakingPricedLP } = require('../helper/staking')
const { usdCompoundExports } = require('../helper/compound')
const sdk = require('@defillama/sdk')

const unitroller = '0xcffef313b69d83cb9ba35d9c0f882b027b846ddc'

const lendingMarket = usdCompoundExports(unitroller, "moonriver", "0x455D0c83623215095849AbCF7Cc046f78E3EDAe0")

module.exports={
    methodology: "Liquidity on DEX and supplied and borrowed amounts found using the comptroller address(0xcffef313b69d83cb9ba35d9c0f882b027b846ddc)",
    misrepresentedTokens: true,
    moonriver:{
        staking: stakingPricedLP("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "moonriver", "0xbBe2f34367972Cb37ae8dea849aE168834440685", "moonriver"),
        tvl: sdk.util.sumChainTvls([
            getChainTvl({moonriver: "https://api.thegraph.com/subgraphs/name/huckleberrydex/huckleberry-subgraph"})('moonriver'),
            lendingMarket.tvl
        ]),
        borrowed: lendingMarket.borrowed
    }
}