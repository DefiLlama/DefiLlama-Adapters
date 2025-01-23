const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  metis:{
    tvl: uniTvlExport("0x633a093C9e94f64500FC8fCBB48e90dd52F6668F", "metis", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, }),
    staking: () => ({}),
  },
}
