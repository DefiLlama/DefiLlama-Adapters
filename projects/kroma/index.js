const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x827962404D7104202C5aaa6b929115C8211d9596",
          "0x31F648572b67e60Ec6eb8E197E1848CC5F5558de",
          "0x7e1Bdb9ee75B6ef1BCAAE3B1De1c616C7B11ef6e",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
