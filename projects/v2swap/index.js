const { getUniTVL } = require('../helper/unknownTokens')
const FACTORY = "0x4811110638201b5878abe23e406DdA9De9Ad7B20" // This factory is on opBNB Mainnet (Chain Id: 204)

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, permitFailure: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address to find and price Liquidity Pool pairs.`,
    op_bnb: {
        tvl: dexTVL,
    }
};