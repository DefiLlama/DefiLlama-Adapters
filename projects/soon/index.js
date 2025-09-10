const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
            '0x5a0702c7ebbec83802b35db737fccdc5fc6c5e07', 
            '0xe822c3d76ac133f7d9f12c39c1bf28a797624aa9'
        ],
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
