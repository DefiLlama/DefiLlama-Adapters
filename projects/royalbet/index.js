const { sumTokens2 } = require("../helper/solana");

module.exports = {
  methodology: "TVL is the SOL held in the TREASURY.",
  solana: {
    tvl: async () => {
      return sumTokens2({
        owners: [
          "FKb3qBvS84unKRxiCQr2Jm1J3JSnUZbik9ddAXqagAfF",
        ],
      });
    },
  },
};
