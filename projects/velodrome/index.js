const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  optimism: {
    tvl: uniTvlExport("0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746", "optimism"),
  }
}