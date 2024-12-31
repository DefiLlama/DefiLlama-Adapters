const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  sonic:{
    tvl: uniTvlExport("0xDDD9845Ba0D8f38d3045f804f67A1a8B9A528FcC", "sonic", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true,  }),
    staking: staking("0x3045119766352fF250b3d45312Bd0973CBF7235a", "0xddF26B42C1d903De8962d3F79a74a501420d5F19"),
  },
}
