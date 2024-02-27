const { getUniTVL } = require('../helper/unknownTokens')

const NANO = "0x28f45eA79c50d3ED9e1FA8A41dC8595F636eC34D";
const FACTORY = "0x41726eb94341fD27D5103DF3Cd6C387560c75B70"

const dexTVL = getUniTVL({
    factory: FACTORY,
    useDefaultCoreAssets: true,
    fetchBalances: true,
})


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses Uniswap-style factory address to find and price liquidity pairs.`,
    base: {
        tvl: dexTVL,
    }
};