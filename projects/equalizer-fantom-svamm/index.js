const {uniTvlExport} = require('../helper/calculateUniTvl.js')
module.exports = {
  misrepresentedTokens: true,
  fantom:{
    tvl: uniTvlExport("0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a", "fantom", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, }),
  }
}