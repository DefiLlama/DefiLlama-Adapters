const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (_, _b, _c, { api, logArray }) =>
      sumTokens2({
        api,
        owners: [
          "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC",
          "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
          "0xcEe284F754E854890e311e3280b767F80797180d",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
