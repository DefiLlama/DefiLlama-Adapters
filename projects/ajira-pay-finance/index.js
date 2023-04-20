const { getUniTVL } = require('../helper/unknownTokens')

const FACTORIES = "0x9DBC0Ad09184226313FbDe094E7c3DD75c94f997"

module.exports = {
    misrepresentedTokens: true,
    methodology: "Ajira Pay Finance Tvl Calculation",
    kava: {
        tvl: getUniTVL({ factory: FACTORIES, chain: 'kava', useDefaultCoreAssets: true }),
    }
};