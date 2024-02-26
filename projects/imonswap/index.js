const { uniTvlExport } = require("../helper/unknownTokens");

const factory = "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0";

module.exports = {
    misrepresentedTokens: true,
    methodology:
      "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through Factory Contract.",
    chz: {
      tvl: getUniTVL({ factory: factory, useDefaultCoreAssets: true, }),
    },
    start: 1701478462, //Dec-2-2023 3:54:26 PM +UTC

  };
  