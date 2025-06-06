const { uniTvlExport } = require("../helper/calculateUniTvl");

module.exports = {
  misrepresentedTokens: true,
  hyperliquid: {
    tvl: uniTvlExport("0x9c7397c9C5ecC400992843408D3A283fE9108009", undefined, undefined, {
    }, { useDefaultCoreAssets: true, hasStablePools: true, }),
  }
};
