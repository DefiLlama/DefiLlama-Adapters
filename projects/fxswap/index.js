const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  functionx: {
    tvl: getUniTVL({
      factory: '0x9E229BE3812228454499FAf771b296bedFe8c904',  useDefaultCoreAssets: true,
    })
  },
};
