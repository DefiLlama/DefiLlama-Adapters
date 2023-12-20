const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: uniTvlExport(
      "0xB9e611CaD79f350929C8E36cAbbe5D2Ce9502D51",
      "base",
      undefined,
      undefined,
      { useDefaultCoreAssets: true, hasStablePools: true, }
    ),
  },
};
