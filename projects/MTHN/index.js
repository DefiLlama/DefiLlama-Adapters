const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = uniTvlExport('bsc', '0xcC0D48a5530Cca0481105cCD61A14C495A51c901', {
  hasStablePools: true,
  useDefaultCoreAssets: false, 
})