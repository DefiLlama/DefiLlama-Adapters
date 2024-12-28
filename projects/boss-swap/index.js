const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    harmony: {
        tvl: getUniTVL({ factory: '0x7f107365E6Ef1F8824C724EA6aF7654AFB742963', useDefaultCoreAssets: true }),
    }
}