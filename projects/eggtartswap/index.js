const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    harmony: {
        tvl: getUniTVL({ factory: '0x65CED3c0Af7CDcC64Fb3eE5F021F9b4E65467812', useDefaultCoreAssets: true }),
    }
} 