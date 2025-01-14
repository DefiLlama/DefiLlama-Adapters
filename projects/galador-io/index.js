const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  mantle: {
    tvl: getUniTVL({ factory: '0x6F602b6F11F174c627813262fA713F334ca20aA6', useDefaultCoreAssets: true }),
  },
};