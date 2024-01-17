const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0xc02155946dd8C89D3D3238A6c8A64D04E2CD4500", useDefaultCoreAssets: true, }),
  },
};