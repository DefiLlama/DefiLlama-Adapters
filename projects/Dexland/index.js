const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({ factory: '0x3D6Cb82318f8c5DAAA9498a379D047a369c1E4aA', useDefaultCoreAssets: true,  }),
  },
};
