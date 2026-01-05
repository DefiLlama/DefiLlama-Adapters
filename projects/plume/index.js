const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: ["0x944ACfC05062339c6862555B42F12d3FB03f8122"],
        fetchCoValentTokens: true,
      }),
  },
};
