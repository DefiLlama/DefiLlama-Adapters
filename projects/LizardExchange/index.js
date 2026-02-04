const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
    oasis: {
        tvl: getUniTVL({ factory: '0xefA6861931991CCE372c477a015619A21dfEBE8c', useDefaultCoreAssets: true }),
    }
}; 