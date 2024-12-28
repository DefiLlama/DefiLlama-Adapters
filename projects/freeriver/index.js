const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    moonriver: {
        tvl: getUniTVL({ factory: '0x52abD262B13bef4E65Ff624880E8A0595a17af48', useDefaultCoreAssets: true }),
    }
}