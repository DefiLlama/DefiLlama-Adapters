const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  uniTvlExport('blast', '0xb4A7D971D0ADea1c73198C97d7ab3f9CE4aaFA13'),
  uniTvlExport('blast', '0x37836821a2c03c171fB1a595767f4a16e2b93Fc4'),
])