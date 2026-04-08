const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xbd4AbB321138e8Eddc399cE64E66451294325a14",
          "0x88FF1e5b602916615391F55854588EFcBB7663f0",
          "0x5d66C1782664115999C47c9fA5cd031f495D3e4F",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
