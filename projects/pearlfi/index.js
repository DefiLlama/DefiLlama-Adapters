const { getUniTVL } = require('../helper/unknownTokens')


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0xd541Bc203Cc2B85810d9b8E6a534eed1615528E2) address to count liquidity in pools as TVL.`,
    polygon: {
        tvl: getUniTVL({ factory: '0xd541Bc203Cc2B85810d9b8E6a534eed1615528E2',  useDefaultCoreAssets: true, hasStablePools: true }),
    }
};