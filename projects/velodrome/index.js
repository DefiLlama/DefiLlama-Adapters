const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  optimism: {
    tvl: uniTvlExport(["0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746","0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a"], "optimism"),
  },
  hallmarks:[
    [1657760400, "First OP grant awarded"],
    [1659618000, "Loss $350k Operational Funds"],
    [1687465883, "v2 Migration on OP Mainnet"],  // https://twitter.com/VelodromeFi/status/1671979216039202816
  ]
}
