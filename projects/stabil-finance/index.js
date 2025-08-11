const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  start: 1639350000,
  cronos: {
    tvl: getUniTVL({
      factory: "0x5d29Dc483D4D0A709DBD9EBb5f3acd41c131B472",
      useDefaultCoreAssets: true,
    }),
  }
};
