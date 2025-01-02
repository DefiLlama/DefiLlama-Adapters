const { uniTvlExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')


module.exports = mergeExports([
  uniTvlExport('klaytn', '0x1a1F14ec33BF8c2e66731f46D0A706e8025b43e9'),
  uniTvlExport('polygon', '0x1289ae78422b94414c1F827C534a1fE8E31E71Aa'),
  uniTvlExport('ethereum', '0x2D723f60ad8da76286B2aC120498A5EA6bAbC792'),
])