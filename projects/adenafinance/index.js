const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    harmony: {
        tvl: getUniTVL({ factory: '0x44485473431fAF6EFA11D346d1057182d2A0A290', useDefaultCoreAssets: true }),
    }
}
