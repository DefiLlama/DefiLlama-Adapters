const { getUniTVL } = require('../helper/unknownTokens')
const { stakingUnknownPricedLP } = require("../helper/staking");

const factory = "0x5da48a338647e2DD79329b557b5729D8496aD83D";
const masterchef = "0x7bA76d4e4cBD4A9B7E3fd9a3B7Db067a51ca9682";
const zks = "0xAbdb137D013b8B328FA43Fc04a6fA340D1CeA733";

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, fetchBalances: true, }),
    staking: stakingUnknownPricedLP(
      masterchef,
      zks,
      "era",
      "0x8489727b22Dd7eF8BbC91E0E88ee781cb2B27274",
      (addr) => `era:${addr}`
    ),
  },
};

