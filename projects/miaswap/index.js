const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  onus: {
    tvl: getUniTVL({  factory: '0xA5DA4dC244c7aD33a0D8a10Ed5d8cFf078E86Ef3', useDefaultCoreAssets: true }),
  }
}