const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  moonriver: {
    tvl: getUniTVL({ factory: '0x049581aEB6Fe262727f290165C29BDAB065a1B68', useDefaultCoreAssets: true, }), 
  },
};
