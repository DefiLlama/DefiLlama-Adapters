const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69",
          "0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
