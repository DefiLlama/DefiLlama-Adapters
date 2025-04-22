const { getUniTVL } = require('../helper/unknownTokens')
const OATH = "0x798aCF1BD6E556F0C3cd72e77b3d169D26a28ab5";
const FACTORY = "0xe4806BdD8E010828324928d25587721F6B58BEA2"

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