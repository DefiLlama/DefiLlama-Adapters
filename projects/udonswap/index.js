const sdk = require('@defillama/sdk');
const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL is calculated by summing the reserves of all DEX pairs on KUB.",
  bitkub: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({
      factory: '0xe8150dCfe6De2c7EFc2e9f96C09d6b83106Af1dE',
      useDefaultCoreAssets: true,
      fetchBalances: true,
      }),
      getUniTVL({
        factory: '0x18c7a4CA020A0c648976208dF2e3AE1BAA32e8d1',
        useDefaultCoreAssets: true,
        fetchBalances: true,
      }),
    ])
  },
};
