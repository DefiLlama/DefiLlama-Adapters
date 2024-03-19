const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  arbitrum: {
    tvl: getUniTVL({ factory: "0xcb85e1222f715a81b8edaeb73b28182fa37cffa8", }),
  },
};
