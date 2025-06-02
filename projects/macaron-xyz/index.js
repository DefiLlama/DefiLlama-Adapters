const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  uniTvlExport('btr', '0x05daB9D11A0e14E68862cd08A73A7362Bb93a331'),
  uniTvlExport('btr', '0x1037E9078df7ab09B9AF78B15D5E7aaD7C1AfDd0'),
])