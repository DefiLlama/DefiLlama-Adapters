const { sumTokens2 } = require("../helper/solana");

const DOGEBTC_MINT = "BwMCF5LSHPvrR8pLVvcsa4k1AMg4VWVnMWUiNEXMtLkE";

// Protocol-owned DogeBTC vaults (funded by 1% transfer tax)
const FACTION_TREASURY_VAULT = "GUrrK4c1RmTDqYbEbWSjq6mfUcujpgTtasU4JXVzEKMA";
const NFT_FLOOR_SWEEP_VAULT = "DRvR4WpLj85Lfvwk3im7Ucrz1s9FPLPUtrTihUiqaPve";

// Protocol-owned SOL vault (staker reward fees from bets)
const STAKER_SOL_REWARD_VAULT = "HiGNRiXWrqtFbwEH1YKQVHommFU15auksXbe7Qv7Nrrb";

module.exports = {
  solana: {
    tvl: async (api) => {
      await sumTokens2({
        api,
        solOwners: [STAKER_SOL_REWARD_VAULT],
      });
    },
    ownTokens: async (api) => {
      await sumTokens2({
        api,
        tokenAccounts: [FACTION_TREASURY_VAULT, NFT_FLOOR_SWEEP_VAULT],
      });
    },
  },
};
