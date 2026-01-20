const { stakingPriceLP } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const dexTVL = getUniTVL({
    factory: '0x017603C8f29F7f6394737628a93c57ffBA1b7256',
    useDefaultCoreAssets: true,
})

module.exports = {
    methodology: "Liquidity on DEX and supplied and borrowed amounts found using the comptroller address(0xcffef313b69d83cb9ba35d9c0f882b027b846ddc)",
    misrepresentedTokens: true,
    moonriver: {
        staking: stakingPriceLP("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "0xbBe2f34367972Cb37ae8dea849aE168834440685", "moonriver"),
        tvl: dexTVL, 
    },
    clv: {
        // tvl: getUniTVL({ factory: '0x4531e148b55d89212E219F612A459fC65f657d7d',  useDefaultCoreAssets: true }),
        tvl: () => ({}),
      },
}