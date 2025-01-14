const ADDRESSES = require('../helper/coreAssets.json')

const Boba_BOBA = ADDRESSES.boba.BOBA;
const Boba_USDT = ADDRESSES.boba.USDT;
const Boba_SHIBUI_WETH = "0xcE9F38532B3d1e00a88e1f3347601dBC632E7a82";
const Boba_SHIBUI_USDT = "0x3f714fe1380ee2204ca499d1d8a171cbdfc39eaa";

module.exports = {
  boba: {
    tvl: async (api) => {
      return api.sumTokens({ owners: [
        "0x9596E01Ad72d2B0fF13fe473cfcc48D3e4BB0f70", // Hot treasury
      ], tokens: [
        Boba_BOBA,
        Boba_USDT,
        Boba_SHIBUI_WETH,
        Boba_SHIBUI_USDT,
      ] });
    },
  },
}
