const { uniTvlExport } = require("../helper/calculateUniTvl.js");

module.exports = {
  era: {
    tvl: uniTvlExport("0x68e03D7B8B3F9669750C1282AD6d36988f4FE18e", "era", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: false, }),
  },
};
