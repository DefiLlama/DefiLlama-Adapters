const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: "0x6Edf8aecAA888896385d7fA19D2AA4eaff3C10D8",
    }),
  },
};
