const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({ factory: '0x20fAfD2B0Ba599416D75Eb54f48cda9812964f46', useDefaultCoreAssets: true }),
  }
};
