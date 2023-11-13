const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (_, _b, _c, { api, logArray }) =>
      sumTokens2({
        api,
        owner: "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
        fetchCoValentTokens: true,
      }),
  },
}; // node test.js projects/avax/index.js
