const { uniTvlExports } = require('../helper/unknownTokens')
module.exports = uniTvlExports({
  'optimism': '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746'
}, { hasStablePools: true, hallmarks:[
    ['2022-07-14', "First OP grant awarded"],
    ['2022-08-04', "Loss $350k Operational Funds"],
  ] })