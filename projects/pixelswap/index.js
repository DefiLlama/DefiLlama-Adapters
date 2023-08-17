const { getUniTVL } = require('../helper/unknownTokens')
const FACTORY = "0xD07739a9E9C46D3DedeD97c0edC49cea8BAB1Bb9"

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
    },
    op_bnb: {
        tvl: dexTVL,
    },
    linea: {
        tvl: dexTVL,
    }
};