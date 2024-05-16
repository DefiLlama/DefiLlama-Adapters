const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "PandoraswapFinance Tvl Calculation",
    astar: {
        tvl: getUniTVL({ factory: '0x8D4f9b98FC21787382647BFCfC9ce75C08B50481', useDefaultCoreAssets: true }),
    },
};