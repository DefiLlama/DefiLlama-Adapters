const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: ['0xa104C0426e95a5538e89131DbB4163d230C35f86', '0xB4968C66BECc8fb4f73b50354301c1aDb2Abaa91'],
        fetchCoValentTokens: true,
      }),
  },
};