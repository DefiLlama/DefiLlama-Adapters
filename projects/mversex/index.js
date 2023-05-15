const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({ factory: "0xd72441aCa423dE457cF866aAD8083A403b11b08B", useDefaultCoreAssets: true, fetchBalances: true, }),
  },
};
