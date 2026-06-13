const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xbaedb5b6da67f96b4125f17dd92f618696494bd3",
          "0x14ea6add7fa61001bd2e38100bfdf2cd710e44d9",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
