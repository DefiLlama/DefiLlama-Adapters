const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xdc1664458d2f0B6090bEa60A8793A4E66c2F1c00",
          "0x1A26ef6575B7BBB864d984D9255C069F6c361a14",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
