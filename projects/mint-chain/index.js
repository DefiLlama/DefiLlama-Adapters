const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
            '0x2b3F201543adF73160bA42E1a5b7750024F30420', 
            '0x59625d1FE0Eeb8114a4d13c863978F39b3471781'
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
