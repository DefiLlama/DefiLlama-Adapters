const { post } = require("../helper/http");

module.exports = {
  methodology:
    "Counts ADA locked in token lending offer pools, and tokens locked as collateral in loans",
  misrepresentedTokens: true,
  cardano: {
    tvl: async () => {
      const data = await post(
        "https://8080-truthful-birthday-xc2vhr.us1.demeter.run/api/v1/token/platform/stats",
        ''
      );
      return {
        cardano: data.totalValueLocked/1e6,
      };
    },
    borrowed: async () => {
      const data = await post(
        "https://8080-truthful-birthday-xc2vhr.us1.demeter.run/api/v1/token/platform/stats",
        ''
      );
      return {
        cardano: data.totalValueBorrowed/1e6,
      };
    },
  },
};
