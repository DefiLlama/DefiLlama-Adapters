const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  arbitrum: {
    tvl: uniTvlExport("0x989CF6bFA8997E8A01Fa07F3009392d1C734c719", "arbitrum"),
  },
  hallmarks:[
  ]
}
