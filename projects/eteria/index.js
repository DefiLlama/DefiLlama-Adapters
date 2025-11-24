const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  eteria: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x79d0FF4D5b05f05D97227F3601C0Ee85937B0513"
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  }
};
