const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async ({ api }) =>
      sumTokens2({
        api,
        owners: [
          "0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC",
          "0x996282cA11E5DEb6B5D122CC3B9A1FcAAD4415Ab",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
