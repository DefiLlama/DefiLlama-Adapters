const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  methodology:
    "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through Factory Contract.",
    start: '2023-12-02', //Dec-2-2023 3:54:26 PM +UTC

  misrepresentedTokens: true,
  chz: {
    tvl: getUniTVL({
      factory: "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
      useDefaultCoreAssets: true,
    }),
  },
};
