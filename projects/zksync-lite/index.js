const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF",
        fetchCoValentTokens: true,
      }),
  },
};
