const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x4C3924E619E2eE83cFD565c1432cb621ca8af7A0",
          "0x3160284BC2F4d7F5b170C70a0Ee0bC5333c7F39e"
        ],
        tokens: ["0x0f813f4785b2360009f9ac9bf6121a85f109efc6", "0x12e96c2bfea6e835cf8dd38a5834fa61cf723736"],
        fetchCoValentTokens: true,
      }),
  }
};
