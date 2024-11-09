const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC",
          "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
          "0xcEe284F754E854890e311e3280b767F80797180d",
          "0xA10c7CE4b876998858b1a9E12b10092229539400",
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
