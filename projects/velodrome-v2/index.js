const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: uniTvlExport("0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, }),
  },
  mode: {
    tvl: uniTvlExport("0x31832f2a97Fd20664D76Cc421207669b55CE4BC0", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, }),
  },
  bob: {
    tvl: uniTvlExport("0x31832f2a97Fd20664D76Cc421207669b55CE4BC0", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, }),
  },
  lisk: {
    tvl: uniTvlExport("0x31832f2a97Fd20664D76Cc421207669b55CE4BC0", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, }),
  },
  fraxtal: {
    tvl: uniTvlExport("0x31832f2a97Fd20664D76Cc421207669b55CE4BC0", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { useDefaultCoreAssets: true, hasStablePools: true, permitFailure: true, }),
  },
  hallmarks: [
    [1687465883, "v2 Migration on OP Mainnet"], // https://twitter.com/VelodromeFi/status/1671979216039202816
  ]
}
