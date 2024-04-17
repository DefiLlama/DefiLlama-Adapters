const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    rsk: {
        tvl: getUniTVL({ factory: '0xfaa7762f551bba9b0eba34d6443d49d0a577c0e1', useDefaultCoreAssets: true }),
    }
}
