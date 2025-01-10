const {uniTvlExport} = require('../helper/calculateUniTvl.js')
module.exports = {
  misrepresentedTokens: true,
  sonic: {
    tvl: uniTvlExport("0xDDD9845Ba0D8f38d3045f804f67A1a8B9A528FcC", "sonic", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, stablePoolSymbol: 's-'}),
  }
}