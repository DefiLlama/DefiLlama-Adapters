const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  celo: {
    tvl: getUniTVL({ factory: '0x62d5b84bE28a183aBB507E125B384122D2C25fAE', useDefaultCoreAssets: true, }), 
  },
};
