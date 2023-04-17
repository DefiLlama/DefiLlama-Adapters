const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: uniTvlExport("0x5892Dc61d3f243Fa397197BaBC3Bb709Af4a0787", "era", undefined, undefined, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}
