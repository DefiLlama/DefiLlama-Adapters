const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    telos:{
        tvl: getUniTVL({ factory: '0x1F2542D8F784565D526eeaDC9F1ca8Fbb75e5996', useDefaultCoreAssets: true }),
    }
}