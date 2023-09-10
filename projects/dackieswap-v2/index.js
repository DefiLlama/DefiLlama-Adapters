const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const DACKIE = "0xc2BC7A73613B9bD5F373FE10B55C59a69F4D617B";
const FACTORY = "0x591f122D1df761E616c13d265006fcbf4c6d6551"


const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    base: {
        tvl: dexTVL
    }
};