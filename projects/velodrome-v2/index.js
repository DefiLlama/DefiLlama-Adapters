const { uniTvlExport } = require('../helper/unknownTokens.js')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: 'function allPools(uint256) view returns (address)',
}
const tvl = uniTvlExport('chain', "0x31832f2a97Fd20664D76Cc421207669b55CE4BC0", { abis, hasStablePools: true, permitFailure: true, }).chain.tvl

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl:  uniTvlExport('chain', "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a", { abis, hasStablePools: true, permitFailure: true, }).chain.tvl,
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
  celo: { tvl },
  hallmarks: [
    [1687465883, "v2 Migration on OP Mainnet"], // https://twitter.com/VelodromeFi/status/1671979216039202816
  ]
}
