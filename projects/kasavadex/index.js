const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    hallmarks: [
        [1660521600, "incentives not given"]
      ],
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x8F1fD6Ed57B0806FF114135F5b50B5f76e9542F2 for kava) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    kava: {
        tvl: getUniTVL({
            factory: '0x8F1fD6Ed57B0806FF114135F5b50B5f76e9542F2',
            chain: 'kava',
            useDefaultCoreAssets: true,
        }),
    }
}
