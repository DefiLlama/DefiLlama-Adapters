const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: uniTvlExport("0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746", undefined, true, undefined, { useDefaultCoreAssets: true, hasStablePools: true, }),
  },
  hallmarks:[
    [1657760400, "First OP grant awarded"],
    [1659618000, "Loss $350k Operational Funds"],
  ]
}
