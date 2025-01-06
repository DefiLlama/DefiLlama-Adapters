const { getUniTVL } = require('../helper/unknownTokens')
const FACTORY = "0xD07739a9E9C46D3DedeD97c0edC49cea8BAB1Bb9"
const ZKSYNC_FACTORY = "0x8435bd22e705DCeFCf6EF8b921E6dB534a4E9902"
const dexTVL = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true,})

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
    },
    arbitrum: {
        tvl: dexTVL,
    },
    era: {
        tvl: getUniTVL({
            factory: ZKSYNC_FACTORY,
            useDefaultCoreAssets: true,
        })
    },
    scroll: {
        tvl: dexTVL,
    }
};

