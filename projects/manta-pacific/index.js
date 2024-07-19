const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x3b95bc951ee0f553ba487327278cac44f29715e5",
          "0x9168765EE952de7C6f8fC6FaD5Ec209B960b7622",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
