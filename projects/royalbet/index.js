const { sumTokens2 } = require("../helper/solana");

module.exports = {
  methodology: "TVL is the SOL held in the manager (escrow) wallet for active bets.",
  solana: {
    tvl: async () => {
      return sumTokens2({
        solOwners: [
          "6LdMpwdL9i5wSM3ujMDdThtVpBeWgMcMtaKWUvpcNeno",
        ],
      });
    },
  },
};
