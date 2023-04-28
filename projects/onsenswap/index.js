const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  start: 1669075200,
  era: {
    tvl: getUniTVL({
      factory: "0x0E15a1a03bD356B17F576c50d23BF7FC00305590",
      useDefaultCoreAssets: true,
    }),
  },
};
