const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({ factory: '0x1aEa6414e7F7A9581Ce53385b2902c59b34D4a94', useDefaultCoreAssets: true,}),
  },
  core: {
    tvl: getUniTVL({ factory: '0x1aEa6414e7F7A9581Ce53385b2902c59b34D4a94', useDefaultCoreAssets: true,})
  },
};
