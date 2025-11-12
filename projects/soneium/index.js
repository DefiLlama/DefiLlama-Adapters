const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xeb9bf100225c214Efc3E7C651ebbaDcF85177607",
          "0x88e529a6ccd302c948689cd5156c83d4614fae92",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
