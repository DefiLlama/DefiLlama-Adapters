const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20',
        fetchCoValentTokens: true,
      }),
  },
};
