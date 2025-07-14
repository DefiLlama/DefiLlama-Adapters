const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  methodology:
    "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through Factory Contract.",
    start: '2023-12-02', //Dec-2-2023 3:54:26 PM +UTC
  misrepresentedTokens: true,
  chz: {
    tvl: getUniTVL({
      factory: "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
      useDefaultCoreAssets: false,
    }),
  },
  avax: {
    tvl: getUniTVL({
      factory: "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
      useDefaultCoreAssets: true,
    }),
  },
  arbitrum: {
    tvl: getUniTVL({
      factory: "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
      useDefaultCoreAssets: true,
    }),
  },
  sonic: {
    tvl: getUniTVL({
      factory: "0xA0BB8f9865f732C277d0C162249A4F6c157ae9D0",
      useDefaultCoreAssets: true,
    }),
  },
  base: {
    tvl: getUniTVL({
      factory: "0x5636A64B835F4E3821C798fdA16E0bA106357646",
      useDefaultCoreAssets: true,
    }),
  },
  bsc: {
    tvl: getUniTVL({
      factory: "0x5636A64B835F4E3821C798fdA16E0bA106357646",
      useDefaultCoreAssets: true,
    }),
  },
};
