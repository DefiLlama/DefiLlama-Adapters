const { uniTvlExport } = require("../helper/calculateUniTvl");

module.exports = {
  misrepresentedTokens: true,
  sonic: {
    tvl: uniTvlExport("0x05c1be79d3aC21Cc4B727eeD58C9B2fF757F5663", undefined, undefined, {
    }, { useDefaultCoreAssets: true, hasStablePools: true, }),
  }
};
