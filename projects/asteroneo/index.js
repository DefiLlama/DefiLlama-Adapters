const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    neox: { tvl: getUniTVL({ factory: '0x1dAbb81D9Faeb1DF4a8c97A60C5269c7D45e66B0', useDefaultCoreAssets: true })}
}