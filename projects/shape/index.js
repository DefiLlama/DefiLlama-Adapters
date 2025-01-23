const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x62Edd5f4930Ea92dCa3fB81689bDD9b9d076b57B",
          '0xEB06fFa16011B5628BaB98E29776361c83741dd3'
        ],
        fetchCoValentTokens: true,
      }),
  },
};
