const { getUniTVL } = require('../helper/unknownTokens')

const FACTORIES = "0x6A6a541FFb214ca228A58c27bD61b5A099Dc82CC"

module.exports = {
    misrepresentedTokens: true,
    methodology: "AGS Finance Tvl Calculation",
    astar: {
        tvl: getUniTVL({ factory: FACTORIES, useDefaultCoreAssets: true }),
    }
};

