const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    neox: { tvl: getUniTVL({ factory: '0x753df473702cB31BB81a93966e658e1AA4f10DD8', useDefaultCoreAssets: true })}
}