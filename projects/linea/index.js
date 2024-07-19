const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xd19d4B5d358258f05D7B411E21A1460D11B0876F",
          "0x051F1D88f0aF5763fB888eC4378b4D8B29ea3319",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
