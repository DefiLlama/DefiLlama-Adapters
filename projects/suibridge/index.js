const { sumTokens2 } = require("../helper/unwrapLPs");
module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owner: "0x312e67b47A2A29AE200184949093D92369F80B53",
        fetchCoValentTokens: true,
        permitFailure: true
      }),
  },
};