const { uniTvlExport } = require("../helper/unknownTokens");

module.exports = uniTvlExport(
  "linea",
  "0x6ed7b91c8133e85921f8028b51a8248488b3336c",
  {
    hasStablePools: true,
    useDefaultCoreAssets: true,
  }
);
