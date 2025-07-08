const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({ factory: "0x6b5F5C4E0076c5841726a3B20B87Eb0709741842", useDefaultCoreAssets: true,})
  },
};