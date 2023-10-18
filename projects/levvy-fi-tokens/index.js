const { post } = require("../helper/http");

module.exports = {
  methodology:
    "Counts ADA locked in token lending offer pools, and tokens locked as collateral in loans",
  misrepresentedTokens: true,
  cardano: {
    tvl: async () => {
      const data = await post(
        "https://citizens.theapesociety.io/api/getLevvyData",
        {}
      );
      return {
        cardano: data.tokens.tvl,
      };
    },
    staking: async () => {
      const data = await post(
        "https://citizens.theapesociety.io/api/getLevvyData",
        {}
      );
      return {
        cardano: data.tokens.staked,
      };
    },
    borrowed: async () => {
      const data = await post(
        "https://citizens.theapesociety.io/api/getLevvyData",
        {}
      );
      return {
        cardano: data.tokens.borrowed,
      };
    },
  },
};
