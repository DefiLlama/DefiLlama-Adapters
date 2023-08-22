const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({ factory: "0x43cC4516B1b549a47B493D06Fc28f6C58BC4e888", useDefaultCoreAssets: true,})
  },
};
