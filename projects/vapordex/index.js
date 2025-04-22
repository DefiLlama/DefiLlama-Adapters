const { getUniTVL } = require("../helper/unknownTokens");

const FACTORY_TELOS = "0xDef9ee39FD82ee57a1b789Bc877E2Cbd88fd5caE";
const FACTORY_AVAX = "0xc009a670e2b02e21e7e75ae98e254f467f7ae257";
const FACTORY_APECHAIN = "0xc009a670e2b02e21e7e75ae98e254f467f7ae257";
module.exports = {
  telos: {
    tvl: getUniTVL({
      factory: FACTORY_TELOS,
      useDefaultCoreAssets: true,
    }),
  },

  avax: {
    tvl: getUniTVL({
      factory: FACTORY_AVAX,
      useDefaultCoreAssets: true,
    }),
  },

  apechain: {
    tvl: getUniTVL({
      factory: FACTORY_APECHAIN,
      useDefaultCoreAssets: true,
    }),
  },

  methodology:
    "TVL comes from the DEX liquidity pools, and is pulled from the factory contract:",
};
