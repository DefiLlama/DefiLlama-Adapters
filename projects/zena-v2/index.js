const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({ factory: "0x8b4FC88973E5b8348640d35E49b1e9cE8AAc180A", useDefaultCoreAssets: true, })
  },
};
