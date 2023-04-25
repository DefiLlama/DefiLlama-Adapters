const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  avax: {
    tvl: uniTvlExport("0xc62Ca231Cd2b0c530C622269dA02374134511a36", "avax", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: false, }),
  },
};

