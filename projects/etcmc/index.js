const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory address (0x164999e9174686b39987dfB7E0FAb28465b867A5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereumclassic: {
    tvl: getUniTVL({
      factory: '0x164999e9174686b39987dfB7E0FAb28465b867A5',
      router: '0x2d18693b77acF8F2785084B0Ae53F6e0627e4376',
      useDefaultCoreAssets: true,
      pools: [
        {
          token0: 'ETCMC-V2',
          token1: 'WETH',
          amount: '1000000000000000000000000000',
          decimals: 18,
        }
      ]
    }),
    staking: {
      '0xca1F5a20E07610d82e28683519c72f6817A3505a': {
        address: '0xca1F5a20E07610d82e28683519c72f6817A3505a',
        tvl: '0xca1F5a20E07610d82e28683519c72f6817A3505a',
      },
    },
    ownTokens: [
      '0x6c3B413C461c42a88160Ed1B1B31d6f7b02a1C83'
    ],
  },
};
