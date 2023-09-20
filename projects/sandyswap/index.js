const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: {
    tvl: uniTvlExport(
      "0xdb9908b6e0b87338194ae8627583194994bd992d",
      "polygon_zkevm",
      undefined,
      undefined,
      { useDefaultCoreAssets: true, hasStablePools: true, fetchBalances: true }
    ),
  },
};
