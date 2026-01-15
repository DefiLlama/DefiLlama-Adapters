const { uniTvlExports } = require('../helper/unknownTokens')
const { hallmarks } = require('../hermes-v2')
module.exports = uniTvlExports({
  'metis': '0x633a093C9e94f64500FC8fCBB48e90dd52F6668F'
}, { hasStablePools: true, })

module.exports = {
  metis: {
  staking: () => ({})
  },
  hallmarks: [
    [1666220400, "Metis Grant"],
    [1723676400, "V1 set to withdraw-only"],
    [1724194800, "V2 Launch"],
  ]
}