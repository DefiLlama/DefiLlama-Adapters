const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  uniTvlExport('btr', '0x4ABB962572B2057A0Ef1E939243F243f7D9f188c')
])