const sdk = require('@defillama/sdk')
const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  optimism: {
    tvl: sdk.util.sumChainTvls([uniTvlExport("0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746"), uniTvlExport("0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { fetchBalances: true,})]),
  },
  hallmarks:[
    [1657760400, "First OP grant awarded"],
    [1659618000, "Loss $350k Operational Funds"],
    [1687465883, "v2 Migration on OP Mainnet"], // https://twitter.com/VelodromeFi/status/1671979216039202816
  ]
}
