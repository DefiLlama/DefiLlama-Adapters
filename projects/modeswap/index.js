const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0x50fd14f0eba5a678c1ebc16bdd3794f09362a95c", useDefaultCoreAssets: true, }),
  },
};