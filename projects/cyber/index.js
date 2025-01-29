const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x12a580c05466eefb2c467C6b115844cDaF55B255",
          "0x1d59bc9fcE6B8E2B1bf86D4777289FFd83D24C99",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
