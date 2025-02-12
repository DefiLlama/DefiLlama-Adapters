const { getUniTVL } = require("../helper/unknownTokens")
const FACTORY = "0x22505cb4d5d10b2c848a9d75c57ea72a66066d8c"

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, permitFailure: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    optimism: {
        tvl: dexTVL,
    }
};
