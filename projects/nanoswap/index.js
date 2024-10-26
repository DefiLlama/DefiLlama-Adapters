const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0x41726eb94341fD27D5103DF3Cd6C387560c75B70"

const dexTVL = getUniTVL({
    factory: FACTORY,
    useDefaultCoreAssets: true,
})


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
    base: {
        tvl: dexTVL,
    }
};