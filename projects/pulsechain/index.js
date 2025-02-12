const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
