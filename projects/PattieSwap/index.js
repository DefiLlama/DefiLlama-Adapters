const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: { tvl: getUniTVL({ factory: '0x71f6a913b317d2BF0Bf51Fd48d90e4cC6e62C4Dd', useDefaultCoreAssets: true, }), },
}
