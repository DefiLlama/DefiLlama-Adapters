const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  bsc: {
    misrepresentedTokens: true,
    tvl: getUniTVL({
      factory: '0x03879e2a3944fd601e7638dfcbc9253fb793b599',
      useDefaultCoreAssets: true,
    })
  }
}