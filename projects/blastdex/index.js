const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  blast: {
    tvl: getUniTVL({
      factory: "0x66346aac17d0e61156AC5F2A934ccF2a9BDe4c65",
      useDefaultCoreAssets: true,
    }),
  },
};
