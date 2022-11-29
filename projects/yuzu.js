const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    oasis: {
        tvl: getUniTVL({ factory: '0x5F50fDC22697591c1D7BfBE8021163Fc73513653', chain: 'oasis', useDefaultCoreAssets: true }),
    },
};