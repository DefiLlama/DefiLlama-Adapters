const { uniTvlExport } = require("../helper/unknownTokens");

module.exports = uniTvlExport(
  "linea",
  "0xbc7695fd00e3b32d08124b7a4287493aee99f9ee",
  {
    hasStablePools: true,
    useDefaultCoreAssets: true,
  }
);
