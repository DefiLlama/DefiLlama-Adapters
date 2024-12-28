const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  start: '2023-04-22',
  era: {
    tvl: getUniTVL({
      factory: "0x0E15a1a03bD356B17F576c50d23BF7FC00305590",
      useDefaultCoreAssets: true,
    }),
  },
};
