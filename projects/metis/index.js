const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (_, _b, _c, { api, logArray }) =>
      sumTokens2({
        api,
        owner: "0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b",
        fetchCoValentTokens: true,
        logArray,
      }),
  },
};
