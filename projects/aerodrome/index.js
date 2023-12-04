const { uniTvlExport } = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: uniTvlExport("0x420DD381b31aEf6683db6B902084cB0FFECe40Da", undefined, undefined, {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    }, { fetchBalances: true, useDefaultCoreAssets: true, hasStablePools: true, }),
  },
}