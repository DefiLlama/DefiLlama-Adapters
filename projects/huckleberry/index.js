const { stakingPricedLP } = require('../helper/staking')
const { usdCompoundExports } = require('../helper/compound')
const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')

const unitroller = '0xcffef313b69d83cb9ba35d9c0f882b027b846ddc'

const lendingMarket = usdCompoundExports(unitroller, "moonriver", "0x455D0c83623215095849AbCF7Cc046f78E3EDAe0")

const dexTVL = getUniTVL({
    factory: '0x017603C8f29F7f6394737628a93c57ffBA1b7256',
    chain: 'moonriver',
    coreAssets: [
        "0x98878B06940aE243284CA214f92Bb71a2b032B8A", // WMOVR
        '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d', // moonriver
        "0xb44a9b6905af7c801311e8f4e76932ee959c663c", // usdt
        "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", // usdc
        "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // eth
    ]
})

module.exports = {
    methodology: "Liquidity on DEX and supplied and borrowed amounts found using the comptroller address(0xcffef313b69d83cb9ba35d9c0f882b027b846ddc)",
    misrepresentedTokens: true,
    moonriver: {
        staking: stakingPricedLP("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "moonriver", "0xbBe2f34367972Cb37ae8dea849aE168834440685", "moonriver"),
        tvl: sdk.util.sumChainTvls([
            dexTVL, lendingMarket.tvl,
        ]),
        borrowed: lendingMarket.borrowed
    }
}