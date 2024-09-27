const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL counts the liquidity on all AMM pools. The factory addresses are used to find the pools.",
  scroll: {
    tvl: getUniTVL({
      factory: "0xCc570Ec20eCB62cd9589FA33724514BDBc98DC7E",
      useDefaultCoreAssets: true,
    }),
  },
  linea: {
    tvl: getUniTVL({
      factory: "0xCc570Ec20eCB62cd9589FA33724514BDBc98DC7E",
      useDefaultCoreAssets: true,
    }),
  },
};
