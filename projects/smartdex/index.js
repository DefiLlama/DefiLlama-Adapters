const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({ factory: '0xBE087BeD88539d28664c9998FE3f180ea7b9749C', useDefaultCoreAssets: true, }), 
  },
};
