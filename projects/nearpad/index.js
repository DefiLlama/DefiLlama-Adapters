const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    tvl: getUniTVL({ factory: '0x34484b4E416f5d4B45D4Add0B6eF6Ca08FcED8f1', useDefaultCoreAssets: true }),
  },
}
