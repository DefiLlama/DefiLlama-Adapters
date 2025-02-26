const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0x05CDC3ec49C623dCE7947172fECFc5d3cD8d16cD", useDefaultCoreAssets: true, }),
  },
};
