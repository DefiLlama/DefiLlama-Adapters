const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
        misrepresentedTokens: true,
    methodology: "Factory address (0x26e13874ad1cd512b29795dafe3937e1c6f6d507) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    zyx: {
        tvl: getUniTVL({ factory: '0x26e13874ad1cd512b29795dafe3937e1c6f6d507', useDefaultCoreAssets: true }),
    }
}
