const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
    pulse: {
    tvl: getUniTVL({ factory: '0xD56B9f53A1CAf0a6b66B209a54DAE5C5D40dE622', useDefaultCoreAssets: true, }),
  },
};