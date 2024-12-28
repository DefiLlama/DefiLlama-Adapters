const { getUniTVL } = require('../helper/unknownTokens')
const ALB = "0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4";
const FACTORY = "0x2d5dd5fa7B8a1BFBDbB0916B42280208Ee6DE51e"


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
    base: {
        tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, }),
    }
};