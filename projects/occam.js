const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    milkomeda: {
        tvl: getUniTVL({ factory: '0x2ef06A90b0E7Ae3ae508e83Ea6628a3987945460', chain: 'milkomeda', useDefaultCoreAssets: true }),
    }
}
