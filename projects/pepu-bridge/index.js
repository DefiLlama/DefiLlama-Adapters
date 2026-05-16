const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xd3643255ea784c75a5325cc5a4a549c7cd62e499", 
          "0x7c2838461fa468896a06ca1e7d88bdece1f2e1be"
        ],
        fetchCoValentTokens: true,
      }),
  },
};
