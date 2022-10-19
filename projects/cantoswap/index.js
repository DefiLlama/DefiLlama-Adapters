const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      chain: "canto",
      factory: "0x6eE19E5e5F1018c26bDa107cB2CCd9dA461A698c",
      useDefaultCoreAssets: true,
    }),
  },
};
