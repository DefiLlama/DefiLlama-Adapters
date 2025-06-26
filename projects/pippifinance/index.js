const { getUniTVL } = require('../helper/unknownTokens')

const PIPPI_FACTORY  = "0x979efE7cA072b72d6388f415d042951dDF13036e";

module.exports = {
    heco: {
        tvl: getUniTVL({
            factory: PIPPI_FACTORY,
            useDefaultCoreAssets: true,
        }),
    },
};

module.exports.deadFrom = '2025-01-15'  // Heco chain is retired