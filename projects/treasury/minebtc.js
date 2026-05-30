const { sumTokens2 } = require("../helper/solana");

// Protocol-owned SOL vaults
const SOL_TREASURY = "2TU3jP7vnhPD1ksVmSMQhuAauuFCuj9magtMWDW65jEx";
const BUYBACKS_SOL_VAULT = "DdatmQD4g2vQdgAw7RvdZFYSouTEB4ebjXWAqH1T86rs";
const NFT_SWEEP_SOL_VAULT = "4XDwhMaA98MaiVXpiqbevr9Kwmp9xGV2nGzQVeF7hbRq";

module.exports = {
  solana: {
    tvl: async (api) => {
      await sumTokens2({
        api,
        solOwners: [SOL_TREASURY, BUYBACKS_SOL_VAULT, NFT_SWEEP_SOL_VAULT],
      });
    },
  },
};
