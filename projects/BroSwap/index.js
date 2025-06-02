const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({ factory: '0x8edF7B8411b2e5dB740dbbf949E011e59fc7980a', useDefaultCoreAssets: true,  }),
  },
};
