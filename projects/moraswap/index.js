const { getUniTVL } = require('../helper/unknownTokens')


const dexTVL_neon = getUniTVL({ factory: '0xd43F135f6667174f695ecB7DD2B5f953d161e4d1', useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0xd43F135f6667174f695ecB7DD2B5f953d161e4d1) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    neon: {
        tvl: dexTVL_neon,
    }
};


