const { getUniTVL } = require('../helper/unknownTokens')
const FACTORY = "0xE6c8488a3078f474D0B75E4ac06a369e3Fb39d76" // This factory is on opBNB Mainnet (Chain Id: 204)

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true,  permitFailure: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address to find and price Liquidity Pool pairs.`,
    op_bnb: {
        tvl: dexTVL,
    }
};