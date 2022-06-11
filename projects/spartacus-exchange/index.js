const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,  
  fantom: {
    tvl: uniTvlExport("0x535646cf57E4155Df723bb24625f356d98ae9D2F", "fantom"),
  }
}// node test.js projects/spartacus-exchange/index.js