const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: uniTvlExport("0xb334a709dd2146caced08e698c05d4d22e2ac046", "avax", undefined, undefined, { useDefaultCoreAssets: true, hasStablePools: true, }),
  }
}