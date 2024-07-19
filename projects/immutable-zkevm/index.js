const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async ({ api }) =>
      sumTokens2({
        api,
        owner: "0xBa5E35E26Ae59c7aea6F029B68c6460De2d13eB6",
        fetchCoValentTokens: true,
      }),
  },
};
