const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  arbitrum: {
    tvl: getUniTVL({ factory: "0xcb85e1222f715a81b8edaeb73b28182fa37cffa8", }),
  },
  base: {
    tvl: getUniTVL({ factory: "0x9a9a171c69cc811dc6b59bb2f9990e34a22fc971", }),
  },
  ethereum: {
    tvl: getUniTVL({ factory: "0x5fbe219e88f6c6f214ce6f5b1fcaa0294f31ae1b", }),
  },
};
