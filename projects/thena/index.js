const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = uniTvlExport('bsc', '0xafd89d21bdb66d00817d4153e055830b1c2b3970', {
  hasStablePools: true,
  useDefaultCoreAssets: false, 
})