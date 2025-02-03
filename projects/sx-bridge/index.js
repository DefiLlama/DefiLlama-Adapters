const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0xa104C0426e95a5538e89131DbB4163d230C35f86',
        fetchCoValentTokens: true,
      }),
  },
};