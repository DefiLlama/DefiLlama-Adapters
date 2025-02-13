const { getUniTVL } = require('../helper/unknownTokens')
const dexTVL = getUniTVL({ factory: '0x0Ec621393958dD9865B912CBdFf808d175B1B9f4', useDefaultCoreAssets: true })
module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0x0Ec621393958dD9865B912CBdFf808d175B1B9f4) address and whitelisted tokens address to find and price Liquidity Pool pairs.`,
    berachain: {
        tvl: dexTVL
    }
};


