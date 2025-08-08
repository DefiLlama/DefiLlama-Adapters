const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x5eaa10F99e7e6D177eF9F74E519E319aa49f191e",
          "0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
