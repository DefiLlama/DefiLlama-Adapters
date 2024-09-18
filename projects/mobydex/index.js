const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({
      factory: "0x9864C78acCe7837Ad1DA8f9BbECcf2dbE562e698",
      useDefaultCoreAssets: true,
    }),
  },
};
