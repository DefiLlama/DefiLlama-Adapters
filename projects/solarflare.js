const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    moonbeam: {
        tvl: getUniTVL({ factory: '0x19B85ae92947E0725d5265fFB3389e7E4F191FDa', useDefaultCoreAssets: true }),
    }
}
