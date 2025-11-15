const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  eteria: {
    tvl: getUniTVL({
      factory: '0x3aE1EDcf59479ee99D2A7478E77AF1A442D85714',
      useDefaultCoreAssets: true,
    }),
  }
};
