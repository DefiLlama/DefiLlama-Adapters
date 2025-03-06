const { getUniTVL } = require('../helper/unknownTokens')
const BSWAP = "0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9";
const FACTORY = "0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB"

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, permitFailure: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $BSWAP staking.`,
    base: {
        tvl: dexTVL,
    }
};
