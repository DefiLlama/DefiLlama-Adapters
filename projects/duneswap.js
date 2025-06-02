const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    oasis: {
        tvl: getUniTVL({ factory: '0x9dd422B52618f4eDD13E08c840f2b6835F3C0585', useDefaultCoreAssets: true }),
    }
}