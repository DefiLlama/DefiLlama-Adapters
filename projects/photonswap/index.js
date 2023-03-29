const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x462C98Cae5AffEED576c98A55dAA922604e2D875 for cronos, 0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5 for kava, 0x1c671d6fEC45Ec0de88C82e6D8536bFe33F00c8a for evmos) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl: getUniTVL({
            factory: '0x462C98Cae5AffEED576c98A55dAA922604e2D875',
            chain: 'cronos',
            useDefaultCoreAssets: true,
        }),
    },
    evmos: {
        tvl: getUniTVL({
            factory: '0x1c671d6fEC45Ec0de88C82e6D8536bFe33F00c8a',
            chain: 'evmos',
            useDefaultCoreAssets: true,
        }),
    },
    kava: {
        tvl: getUniTVL({
            factory: '0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5',
            chain: 'kava',
            useDefaultCoreAssets: true,
        }),
    }
}