const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl: getUniTVL({
      chain: "canto",
      factory: "0x6eE19E5e5F1018c26bDa107cB2CCd9dA461A698c",
      useDefaultCoreAssets: true,
      blacklist: ["0x7264610a66eca758a8ce95cf11ff5741e1fd0455"],
    }),
  },
};
