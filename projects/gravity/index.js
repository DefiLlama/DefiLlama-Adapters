const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x34C0bD5877A5Ee7099D0f5688D65F4bB9158BDE2",
          "0x36cb65c1967A0Fb0EEE11569C51C2f2aA1Ca6f6D",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
