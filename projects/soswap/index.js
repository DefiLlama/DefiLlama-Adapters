const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0x539db2B4FE8016DB2594d7CfbeAb4d2B730b723E"


const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    base: {
        tvl: dexTVL
    }
};