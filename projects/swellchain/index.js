const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x7aA4960908B13D104bf056B23E2C76B43c5AACc8",
        "0x758E0EE66102816F5C3Ec9ECc1188860fbb87812",
      ],
      fetchCoValentTokens: true,
    }),
  }
};
