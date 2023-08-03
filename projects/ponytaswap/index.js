const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  rpg: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x1589DD24f11e1e49566fE99744E7487CbcAb2d43',
    })
  }
}