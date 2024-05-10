const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
        misrepresentedTokens: false,
    methodology: "Factory address (0xF660558a4757Fb5953d269FF32E228Ae3d5f6c68) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    bahamut: {
        tvl: getUniTVL({ factory: '0xF660558a4757Fb5953d269FF32E228Ae3d5f6c68', useDefaultCoreAssets: true }),
    }
}