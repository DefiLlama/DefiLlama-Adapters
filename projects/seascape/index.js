const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    moonriver: {
        tvl: getUniTVL({ factory: '0xD184B1317125b166f01e8a0d6088ce1de61D00BA', useDefaultCoreAssets: true }),
    }
}