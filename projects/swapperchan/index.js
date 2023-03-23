const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    boba:{
        tvl: getUniTVL({
          factory: '0x3d97964506800d433fb5dbebdd0c202ec9b62557',
          chain: 'boba',
          useDefaultCoreAssets: true,
        })
    }
}
