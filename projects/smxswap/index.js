const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  uniTvlExport('cronos', '0x1Ed37E4323E429C3fBc28461c14A181CD20FC4E8'),
  uniTvlExport('bsc', '0x2C3408a4827DF0419DA2f53eAe92f338B4d314ec'),
  uniTvlExport('polygon', '0xDD4047F11c80f7831922904Ddb61E370E83D5fbb'),
])