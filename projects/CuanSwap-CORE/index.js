const { getUniTVL } = require("../helper/unknownTokens");

const chain = "core";

module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      factory: "0x23556027Ad3C3e76160AcA51e8098C395a6d815C",
      useDefaultCoreAssets: true,
    }),
  },
};
