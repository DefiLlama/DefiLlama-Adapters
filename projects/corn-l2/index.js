const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        "0x8bc93498b861fd98277c3b51d240e7e56e48f23c",
        "0x6d85d1c7f58fd5d05b1b633e8b0ce2e57fca9d80",        
      ],
      fetchCoValentTokens: true,
      permitFailure: true
    }),
  },
};
