const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
    bitrock: {
        tvl: getUniTVL({ factory: '0x02c73ecb9B82e545E32665eDc42Ae903F8AA86a9', useDefaultCoreAssets: true, fetchBalances: true }),
    }
}
