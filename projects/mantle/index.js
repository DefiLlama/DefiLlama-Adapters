const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (_, _b, _c, { api, logArray }) =>
      sumTokens2({
        api,
        owner: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
        fetchCoValentTokens: true,
        logArray,
      }),
  },
};
