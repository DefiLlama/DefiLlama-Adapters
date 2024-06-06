const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ factory: '0x58C8CD291Fa36130119E6dEb9E520fbb6AcA1c3a', useDefaultCoreAssets: true, }),
  },
}