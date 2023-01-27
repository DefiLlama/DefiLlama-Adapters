const { getTVL } = require("./getTVL");

const chain = "kava";

module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getTVL({
      chain,
      factory: "0xbD4C56E952c238389AEE995E1ed504cA646D199B",
      useDefaultCoreAssets: true,
    }),
  },
};
