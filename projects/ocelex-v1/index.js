const { uniTvlExport } = require("../helper/unknownTokens");

module.exports = uniTvlExport("zircuit", "0xdd018347c29a27088eb2d0bf0637d9a05b30666c", { 
  hasStablePools: true, 
  useDefaultCoreAssets: true,
});
