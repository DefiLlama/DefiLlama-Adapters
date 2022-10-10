const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory addresses (0xB702C2917f47012C331C6c65B74e07dA61260Bd4 for kava) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    kava: {
        tvl: getUniTVL({
            factory: '0xB702C2917f47012C331C6c65B74e07dA61260Bd4',
            chain: 'kava',
            useDefaultCoreAssets: true,
        }),
    }
}