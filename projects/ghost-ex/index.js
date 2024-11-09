const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  blast: {
    tvl: getUniTVL({
      factory: "0xbf246e99a848d9bf592c216118973204162d9650",
      useDefaultCoreAssets: true,
    }),
  },
}
