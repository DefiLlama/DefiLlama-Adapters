const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: "0x9cb4706e20A18E59a48ffa7616d700A3891e1861",
        fetchCoValentTokens: true,
      }),
  },
};
