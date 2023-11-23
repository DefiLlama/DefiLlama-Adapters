const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  // deadFrom: '30-09-2023',
  misrepresentedTokens: true,
  muuchain: {
    // tvl: getUniTVL({ factory: '0x058f3f7857d47326021451b6b67c3e92838a6edc', useDefaultCoreAssets: true, })
    tvl: () => ({})
  },
};

