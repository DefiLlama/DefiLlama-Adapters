const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x32400084C286CF3E17e7B677ea9583e60a000324",
          "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
          "0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB"
        ],
        fetchCoValentTokens: true,
      }),
  },
};
