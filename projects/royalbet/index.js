const { sumTokens2 } = require("../helper/solana");

module.exports = {
  methodology: "TVL is the SOL held in the TREASURY.",
  solana: {
    tvl: async () => {
      return sumTokens2({
        owners: [
          "6LdMpwdL9i5wSM3ujMDdThtVpBeWgMcMtaKWUvpcNeno",
        ],
      });
    },
  },
};
