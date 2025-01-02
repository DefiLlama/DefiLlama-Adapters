const { getUniTVL } = require("../helper/unknownTokens");

const chain = "dogechain";

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      factory: "0x8B8CFD13ec09454E6440A4812ed306796a4Fb3eE",
      useDefaultCoreAssets: true,
    }),
  },
};
