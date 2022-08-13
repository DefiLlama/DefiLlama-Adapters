const { stakingPricedLP } = require('../helper/staking')
const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");



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
        tvl: dexTVL, 
    },
    clv: {
        tvl: calculateUsdUniTvl(
          "0x4531e148b55d89212E219F612A459fC65f657d7d",
          "clv",
          "0x6d6ad95425fcf315c39fa6f3226471d4f16f27b3",
          [
            "0xbea4928632e482a0a1241b38f596a311ad7b98b1", //finn
            "0x1bbc16260d5d052f1493b8f2aeee7888fed1e9ab"  //usdc
          ],
          "clover-finance"
        ),
      },
}