const { getUniTVL } = require('./helper/unknownTokens')
module.exports = {
    oasis: {
        tvl: getUniTVL({ factory: '0x84b11e8fb9a5dE10347eEA24c73d02B835505FDd', chain: 'oasis', useDefaultCoreAssets: true }),
    }
};