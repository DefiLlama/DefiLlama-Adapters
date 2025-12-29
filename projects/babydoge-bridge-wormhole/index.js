const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/solana");

const BSC_BRIDGE = "0xac65072FC013442E14CCe3C8dc47e10dEe3E0683";
const BSC_TOKEN = "0xc748673057861a797275CD8A068AbB95A902e8de"; // BabyDoge

const SOLANA_BRIDGE_VAULT = "4bhMeAzoU3EenGxKXTo7nWjKVNqg1YTrN6rHLCasyvxs";
const SOLANA_TOKEN = "7dUKUopcNWW6CcU4eRxCHh1uiMh32zDrmGf6ufqhxann"; // BabyDoge

module.exports = {
  methodology: "Tracks BabyDoge tokens locked in BSC-Solana Wormhole bridge contracts",
  bsc: {
    tvl: sumTokensExport({ owners: [BSC_BRIDGE], tokens: [BSC_TOKEN] }),
  },
  solana: {
    tvl: async (api) => sumTokens2({ 
      api, 
      tokensAndOwners: [[SOLANA_TOKEN, SOLANA_BRIDGE_VAULT]] 
    }),
  },
};

