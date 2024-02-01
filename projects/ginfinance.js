const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    boba: {
        tvl: getUniTVL({ factory: '0x06350499760aa3ea20FEd2837321a84a92417f39', useDefaultCoreAssets: true }),
    }
};