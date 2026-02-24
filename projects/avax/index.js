const { sumTokens2 } = require("../helper/unwrapLPs");
const { bitcoin } = require("../avalance-btc");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: "0x8EB8a3b98659Cce290402893d0123abb75E3ab28",
        fetchCoValentTokens: true,
      }),
  },
  bitcoin,
};
