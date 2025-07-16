const { uniTvlExport } = require('../helper/calculateUniTvl.js')

const tvl = uniTvlExport("0x31832f2a97Fd20664D76Cc421207669b55CE4BC0", undefined, undefined, {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)',
}, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, })

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: uniTvlExport("0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, }),
  },
  mode: { tvl },
  bob: { tvl },
  lisk: { tvl },
  fraxtal: { tvl },
  ink: { tvl },
  soneium: { tvl },
  sseed: { tvl },
  unichain: { tvl },
  swellchain: { tvl },
  hallmarks: [
    [1687465883, "v2 Migration on OP Mainnet"], // https://twitter.com/VelodromeFi/status/1671979216039202816
  ]
}
