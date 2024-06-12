const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  taiko: {
    tvl: uniTvlExport("0x535E02960574d8155596a73c7Ad66e87e37Eb6Bc", undefined, true, undefined, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}
