const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0xc02155946dd8C89D3D3238A6c8A64D04E2CD4500", useDefaultCoreAssets: true, }),
  },
  base: {
    tvl: getUniTVL({ factory: "0x14658340D7D1c112b62509bbF449be1897e8dE01", useDefaultCoreAssets: true, }),
  },
};