const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    etn: {
        tvl: getUniTVL({ factory: '0x203D550ed6fA9dAB8A4190720CF9F65138abd15B', useDefaultCoreAssets: false }),
    }
} 