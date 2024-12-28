const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07",
          "0x735aDBbE72226BD52e818E7181953f42E3b0FF21",
        ],
        fetchCoValentTokens: true,
      }),
  },
};
