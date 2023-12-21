const { getUniTVL } = require('../helper/unknownTokens')
const TORUS = "0x736063A68A99a8E2943DA3952A676384154Ac0B6";
const FACTORY = "0x259b3217A01878ea9d64b45eE48231e660863ee7"

const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, permitFailure: true })

module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(${FACTORY}) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    base: {
        tvl: dexTVL,
    }
};
