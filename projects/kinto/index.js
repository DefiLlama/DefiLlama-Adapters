const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x0f1b7bd7762662B23486320AA91F30312184f70C",
          "0x859a53Fe2C8DA961387030E7CB498D6D20d0B2DB",
          "0x7870D5398DB488c669B406fBE57b8d05b6A35e42"
        ],
        fetchCoValentTokens: true,
      }),
  },
};
