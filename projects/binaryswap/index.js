const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({ factory: "0xd50aaE6C73E2486B0Da718D23F35Dcf5aad25911", useDefaultCoreAssets: true,})
  },
};