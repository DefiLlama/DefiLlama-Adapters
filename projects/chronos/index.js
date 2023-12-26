const { getUniTVL } = require('../helper/unknownTokens')


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0xCe9240869391928253Ed9cc9Bcb8cb98CB5B0722) address to count liquidity in pools as TVL.`,
    arbitrum: {
        tvl: getUniTVL({ factory: '0xCe9240869391928253Ed9cc9Bcb8cb98CB5B0722',  useDefaultCoreAssets: true, hasStablePools: true }),
    }
};
