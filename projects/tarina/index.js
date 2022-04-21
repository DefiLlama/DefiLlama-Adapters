const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,  
  avalanche: {
    tvl: uniTvlExport("0xb334a709dd2146caced08e698c05d4d22e2ac046", "avax"),
  }
}