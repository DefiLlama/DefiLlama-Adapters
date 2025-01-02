const { getUniTVL } = require('../helper/unknownTokens')
const FACTORY = "0x57592D44eb60011500961EF177BFf8D8691D5a8B"

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true })

module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    base: {
        tvl: dexTVL,
    }
};
