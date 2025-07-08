const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'metis': '0x633a093C9e94f64500FC8fCBB48e90dd52F6668F'
}, { hasStablePools: true, })

module.exports.metis.staking = () => ({})