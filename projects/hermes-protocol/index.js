const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  metis:{
    tvl: uniTvlExport("0x633a093C9e94f64500FC8fCBB48e90dd52F6668F", "metis", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, }),
    staking: staking("0xa4C546c8F3ca15aa537D2ac3f62EE808d915B65b", "0xb27bbeaaca2c00d6258c3118bab6b5b6975161c8"),
  },
}
