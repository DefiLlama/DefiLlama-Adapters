const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: getUniTVL({ factory: '0x26F53fbADeEb777fb2A122dC703433d79241b64e', useDefaultCoreAssets: true, }),
  },
};