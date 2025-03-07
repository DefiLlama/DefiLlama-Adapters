const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  sonic: {
    tvl: uniTvlExport("0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8", undefined, undefined, {
        useDefaultCoreAssets: true,
        hasStablePools: true,
    }),
  },
}