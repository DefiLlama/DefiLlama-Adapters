const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  plasma: {
    tvl: getUniTVL({
      factory: "0x71a870D1c935C2146b87644DF3B5316e8756aE18",
      useDefaultCoreAssets: true,
    }),
  },
};
