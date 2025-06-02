const { sumTokensExport } = require("../helper/unwrapLPs");

const ocean = "0x967da4048cD07aB37855c090aAF366e4ce1b9F48";
const oceanCollateralJoin = "0x13288BD148160f76B37Bea93861cA61BAea120D1";

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: oceanCollateralJoin, tokens: [ocean], }),
  }
};