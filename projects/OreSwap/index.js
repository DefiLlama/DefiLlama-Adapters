const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({ factory: '0xbA862e0B955c612EEd514E722c84F1E70962457e', useDefaultCoreAssets: true, }),
  },
};
