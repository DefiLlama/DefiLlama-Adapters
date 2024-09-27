const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  shibarium: {
    tvl: getUniTVL({ factory: "0x938e62594610Dd35A25a1DfE35C94fA0A9f6bfAA", useDefaultCoreAssets: true,})
  }
}
