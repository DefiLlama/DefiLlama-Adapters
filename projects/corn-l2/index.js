const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x8bc93498b861fd98277c3b51d240e7e56e48f23c",
      ],
      fetchCoValentTokens: true,
      permitFailure: true
    }),
  },
};
