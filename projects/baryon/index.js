const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  bsc: {
    misrepresentedTokens: true,
    tvl: getUniTVL({
      factory: '0x03879e2a3944fd601e7638dfcbc9253fb793b599',
      useDefaultCoreAssets: true,
    })
  },
  tomochain: {
    misrepresentedTokens: true,
    tvl: getUniTVL({
      factory: '0xFe48A2E66EE2f90334d3565E56E0c9d0081447e8',
      useDefaultCoreAssets: true,
    })
  }
}