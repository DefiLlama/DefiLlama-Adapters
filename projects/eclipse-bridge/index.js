const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0xd7e4b67e735733ac98a88f13d087d8aac670e644',
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};
